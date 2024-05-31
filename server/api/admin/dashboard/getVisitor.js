const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone');
const readerlogUtils = require('../../../mongodb/utils/readerlogs')


module.exports = async function (req, res, next) {
  const timeRangeType = req.query.timeRangeType
  const timeRangeTypeList = ['today', 'yesterday', 'week', 'month', 'year']
  // 判断timeRangeType是否符合格式
  if (!timeRangeTypeList.includes(timeRangeType)) {
    // 报错
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  const vistorActionList = ['postList', 'postListArchive', 'postListKeyword', 'postListSort', 'postListTag', 'postView']
  const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
  // 根据 timeRangeType 计算开始日期和结束日期
  let startDate, endDate;
  switch (timeRangeType) {
    case 'today':
      startDate = moment().tz(siteTimeZone).startOf('day');
      endDate = moment().tz(siteTimeZone).endOf('day');
      break;
    case 'yesterday':
      startDate = moment().tz(siteTimeZone).subtract(1, 'days').startOf('day');
      endDate = moment().tz(siteTimeZone).subtract(1, 'days').endOf('day');
      break;
    case 'week':
      startDate = moment().tz(siteTimeZone).startOf('week');
      endDate = moment().tz(siteTimeZone).endOf('week');
      break;
    case 'month':
      startDate = moment().tz(siteTimeZone).startOf('month');
      endDate = moment().tz(siteTimeZone).endOf('month');
      break;
    case 'year':
      startDate = moment().tz(siteTimeZone).subtract(1, 'years').startOf('day');
      endDate = moment().tz(siteTimeZone);
      break;
    default:
      break;
  }

  // 打印开始日期和结束日期
  // console.log(startDate.toDate(), endDate.toDate())
  const offset = moment.tz(siteTimeZone).format('Z')
  let $addFields = {
    "formatDate": {
      $dateToString: {
        format: `%Y-%m-%dT%H:00:00.000${offset}`,
        date: "$createdAt",
        timezone: siteTimeZone
      }
    }
  }
  // 如果是年或者月，就按照天分组
  if (timeRangeType === 'year' || timeRangeType === 'month') {
    $addFields = {
      "formatDate": {
        $dateToString: {
          format: `%Y-%m-%dT00:00:00.000${offset}`,
          date: "$createdAt",
          timezone: siteTimeZone
        }
      }
    }
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: vistorActionList },
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
      $addFields,
    },
    {
      $facet: {
        "pv": [
          { $match: { isBot: false } },
          {
            $group: {
              _id: "$formatDate",
              count: { $sum: 1 }
            }
          }
        ],
        "pvCount": [
          { $match: { isBot: false } },
          {
            $count: "count"
          }
        ],
        "robotAccess": [
          { $match: { isBot: true } },
          {
            $group: {
              _id: "$formatDate",
              count: { $sum: 1 }
            }
          }
        ],
        "robotAccessCount": [
          { $match: { isBot: true } },
          {
            $count: "count"
          }
        ],
        "uniqueIPTimeLine": [
          { $match: { isBot: false } },
          {
            $group: {
              _id: { hour: "$formatDate", ip: "$ip" }
            }
          },
          {
            $group: {
              _id: "$_id.hour",
              count: { $sum: 1 }
            }
          }
        ],
        "uniqueIPCount": [
          { $match: { isBot: false } },
          {
            $group: {
              _id: "$ip"
            }
          },
          {
            $count: "count"
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
      errors: [{
        message: '数据库查询错误'
      }]
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
  }
  // 初始化pv，robotAccess，uniqueIPTimeLine
  switch (timeRangeType) {
    case 'today':
      const now = moment().tz(siteTimeZone);
      const currentDayHour = now.hour();
      for (let i = 0; i <= currentDayHour; i++) {
        const time = now.clone().hour(i).format('YYYY-MM-DDTHH:00:00.000Z');
        sendData.pv.push({ _id: time, count: 0 });
        sendData.robotAccess.push({ _id: time, count: 0 });
        sendData.uniqueIPTimeLine.push({ _id: time, count: 0 });
      }
      break;
    case 'yesterday':
      const yesterday = startDate;
      for (let i = 0; i <= 23; i++) {
        const time = yesterday.clone().hour(i).format('YYYY-MM-DDTHH:00:00.000Z');
        sendData.pv.push({ _id: time, count: 0 });
        sendData.robotAccess.push({ _id: time, count: 0 });
        sendData.uniqueIPTimeLine.push({ _id: time, count: 0 });
      }
      break;
    case 'week':
      const nowWeek = moment().tz(siteTimeZone);
      const currentDayOfWeek = nowWeek.day();
      const currentHour = nowWeek.hour();
      for (let i = 0; i <= currentDayOfWeek; i++) {
        const day = nowWeek.clone().startOf('week').add(i, 'days');
        const maxHour = i < currentDayOfWeek ? 23 : currentHour;
        for (let j = 0; j <= maxHour; j++) {
          const time = day.clone().hour(j).format('YYYY-MM-DDTHH:00:00.000Z');
          const data = { _id: time, count: 0 };
          sendData.pv.push({ ...data });
          sendData.robotAccess.push({ ...data });
          sendData.uniqueIPTimeLine.push({ ...data });
        }
      }
      break;
    case 'month':
      const nowMonth = moment().tz(siteTimeZone);
      const startOfMonth = nowMonth.clone().startOf('month');
      const days = nowMonth.daysInMonth();
      for (let i = 1; i <= days; i++) {
        const time = startOfMonth.clone().add(i - 1, 'days').format('YYYY-MM-DDTHH:00:00.000Z');
        sendData.pv.push({ _id: time, count: 0 });
        sendData.robotAccess.push({ _id: time, count: 0 });
        sendData.uniqueIPTimeLine.push({ _id: time, count: 0 });
      }
      break;
    case 'year':
      const daysOfYear = endDate.diff(startDate, 'days');
      for (let i = 0; i <= daysOfYear; i++) {
        const time = startDate.clone().add(i, 'days').format('YYYY-MM-DDTHH:00:00.000Z');
        sendData.pv.push({ _id: time, count: 0 });
        sendData.robotAccess.push({ _id: time, count: 0 });
        sendData.uniqueIPTimeLine.push({ _id: time, count: 0 });
      }
      break;

    default:
      break;
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
        const index = sendData.uniqueIPTimeLine.findIndex(i => i._id === item._id)
        if (index !== -1) {
          sendData.uniqueIPTimeLine[index].count = item.count
        }
      })
    }

    sendData.uniqueIPCount = readData[0]?.uniqueIPCount[0]?.count || 0
  }

  // 发送响应
  res.send(sendData);
}
