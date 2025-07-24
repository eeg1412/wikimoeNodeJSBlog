const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')

module.exports = async function (req, res, next) {
  const startTime = req.query.startTime
  const endTime = req.query.endTime
  const timeZone = req.query.timeZone

  // 校验 timeZone 是否合法
  const validTimeZones = moment.tz.names()
  if (!validTimeZones.includes(timeZone)) {
    res.status(400).json({
      errors: [
        {
          message: '时区不合法'
        }
      ]
    })
    return
  }
  // 时间格式是 2023-08-10T15:00:00.000Z 需要判断合法性
  const rule = [
    // startTime
    {
      key: 'startTime',
      label: '开始时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true
      }
    },
    // endTime
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  ]

  const errors = utils.checkForm(
    {
      startTime,
      endTime
    },
    rule
  )
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const vistorActionList = [
    'postList',
    'postListArchive',
    'postListKeyword',
    'postListSort',
    'postListTag',
    'postListBangumi',
    'postListMovie',
    'postListBook',
    'postListGame',
    'postView'
  ]
  // 根据 timeRangeType 计算开始日期和结束日期
  const startDate = moment(startTime)
  const endDate = moment(endTime)

  // 数据是否超过一定小时数
  let diffHours = endDate.diff(startDate, 'hours')

  let isOverDays = false
  if (diffHours > 72) {
    isOverDays = true
  }

  let offset = null

  // 打印开始日期和结束日期
  let $addFields = {
    formatDate: {
      $dateToString: {
        format: `%Y-%m-%dT%H:00:00.000Z`,
        date: '$createdAt'
      }
    }
  }
  // 如果超过一定天数，就按天数来统计
  if (isOverDays) {
    offset = moment.tz(timeZone).format('Z')
    $addFields = {
      formatDate: {
        $dateToString: {
          format: `%Y-%m-%dT00:00:00.000${offset}`,
          date: '$createdAt',
          timezone: timeZone
        }
      }
    }
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: vistorActionList }
      }
    },
    // 按时间和id排序
    {
      $sort: {
        createdAt: 1,
        _id: 1
      }
    },
    {
      $addFields
    },
    {
      $facet: {
        pv: [
          { $match: { isBot: false } },
          {
            $group: {
              _id: '$formatDate',
              count: { $sum: 1 }
            }
          }
        ],
        pvCount: [
          { $match: { isBot: false } },
          {
            $count: 'count'
          }
        ],
        robotAccess: [
          { $match: { isBot: true } },
          {
            $group: {
              _id: '$formatDate',
              count: { $sum: 1 }
            }
          }
        ],
        robotAccessCount: [
          { $match: { isBot: true } },
          {
            $count: 'count'
          }
        ],
        uniqueIPTimeLine: [
          { $match: { isBot: false } },
          {
            $group: {
              _id: { hour: '$formatDate', ip: '$ip' }
            }
          },
          {
            $group: {
              _id: '$_id.hour',
              count: { $sum: 1 }
            }
          }
        ],
        uniqueIPCount: [
          { $match: { isBot: false } },
          {
            $group: {
              _id: '$ip'
            }
          },
          {
            $count: 'count'
          }
        ]
      }
    }
  ]
  const readData = await readerlogUtils.aggregate(pipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })
  if (!readData) {
    res.status(500).json({
      errors: [
        {
          message: '数据库查询错误'
        }
      ]
    })
    return
  }

  let sendData = {
    pv: [],
    pvCount: 0,
    robotAccess: [],
    robotAccessCount: 0,
    uniqueIPTimeLine: [],
    uniqueIPCount: 0,
    isOverDays
  }
  // 初始化pv，robotAccess，uniqueIPTimeLine
  if (!isOverDays) {
    // 按小时统计
    const hoursDifference = endDate.diff(startDate, 'hours')
    for (let i = 0; i <= hoursDifference; i++) {
      const time = startDate
        .clone()
        .tz(timeZone)
        .add(i, 'hours')
        .utc()
        .format('YYYY-MM-DDTHH:00:00.000[Z]')
      sendData.pv.push({ _id: time, count: 0 })
      sendData.robotAccess.push({ _id: time, count: 0 })
      sendData.uniqueIPTimeLine.push({ _id: time, count: 0 })
    }
  } else {
    // 按天统计
    const daysOfYear = endDate.diff(startDate, 'days')
    for (let i = 0; i <= daysOfYear; i++) {
      const time = startDate
        .clone()
        .tz(timeZone)
        .add(i, 'days')
        .format(`YYYY-MM-DDT00:00:00.000${offset}`)
      sendData.pv.push({ _id: time, count: 0 })
      sendData.robotAccess.push({ _id: time, count: 0 })
      sendData.uniqueIPTimeLine.push({ _id: time, count: 0 })
    }
  }
  if (readData.length > 0) {
    const pv = readData[0]?.pv || []
    if (pv.length <= 0) {
      sendData.pv = []
    } else {
      pv.forEach(item => {
        const index = sendData.pv.findIndex(i => i._id === item._id)
        if (index !== -1) {
          sendData.pv[index].count = item.count
        }
      })
    }

    sendData.pvCount = readData[0]?.pvCount[0]?.count || 0
    const robotAccess = readData[0]?.robotAccess || []
    if (robotAccess.length <= 0) {
      sendData.robotAccess = []
    } else {
      robotAccess.forEach(item => {
        const index = sendData.robotAccess.findIndex(i => i._id === item._id)
        if (index !== -1) {
          sendData.robotAccess[index].count = item.count
        }
      })
    }
    sendData.robotAccessCount = readData[0]?.robotAccessCount[0]?.count || 0
    const uniqueIPTimeLine = readData[0]?.uniqueIPTimeLine || []
    if (uniqueIPTimeLine.length <= 0) {
      sendData.uniqueIPTimeLine = []
    } else {
      uniqueIPTimeLine.forEach(item => {
        const index = sendData.uniqueIPTimeLine.findIndex(
          i => i._id === item._id
        )
        if (index !== -1) {
          sendData.uniqueIPTimeLine[index].count = item.count
        }
      })
    }

    sendData.uniqueIPCount = readData[0]?.uniqueIPCount[0]?.count || 0
  }

  // sendData.raw = readData

  // 发送响应
  res.send(sendData)
}
