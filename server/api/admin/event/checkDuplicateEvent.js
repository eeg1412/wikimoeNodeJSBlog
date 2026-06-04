const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

// 单条候选活动的校验规则（仅校验判重所需字段）
const checkRule = [
  {
    key: 'eventtype',
    label: '活动类型',
    type: 'isMongoId',
    required: true
  },
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * 在指定时区下，将某个时间归一化为「本地日序号」（从 1970-01-01 起的整数天）
 * @param {number} timeMs - UTC 毫秒时间戳
 * @param {number} offsetMs - 用户时区相对 UTC 的偏移（毫秒，东京为 +9 小时）
 * @returns {number} 本地日序号
 */
function getLocalDayIndex(timeMs, offsetMs) {
  return Math.floor((timeMs + offsetMs) / ONE_DAY_MS)
}

/**
 * 预检导入的活动是否与数据库中已有活动「日完全重合」
 * 重合判定：活动类型相同，且开始时间的日、结束时间的日均完全一致（按用户时区计算）
 */
module.exports = async function (req, res, next) {
  const { list, timezoneOffsetMinutes } = req.body

  // 校验 list 是否为非空数组
  if (!Array.isArray(list) || list.length === 0) {
    res.status(400).json({
      errors: [
        {
          message: '预检数据格式错误，必须是非空数组'
        }
      ]
    })
    return
  }

  // 限制单次预检的最大数量
  const MAX_CHECK_COUNT = 200
  if (list.length > MAX_CHECK_COUNT) {
    res.status(400).json({
      errors: [
        {
          message: `单次最多预检 ${MAX_CHECK_COUNT} 条活动`
        }
      ]
    })
    return
  }

  // 校验时区偏移
  if (
    typeof timezoneOffsetMinutes !== 'number' ||
    isNaN(timezoneOffsetMinutes)
  ) {
    res.status(400).json({
      errors: [
        {
          message: '时区偏移参数错误'
        }
      ]
    })
    return
  }
  const offsetMs = timezoneOffsetMinutes * 60 * 1000

  // 逐条校验并整理候选数据
  const candidateList = []
  const eventtypeIdSet = new Set()
  let minStartMs = Infinity
  let maxEndMs = -Infinity
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const params = {
      eventtype: item.eventtype,
      startTime: item.startTime,
      endTime: item.endTime
    }
    const errors = utils.checkForm(params, checkRule)
    if (errors.length > 0) {
      res.status(400).json({
        errors: [
          {
            message: `第 ${i + 1} 条活动预检参数错误：${errors[0].message}`
          }
        ]
      })
      return
    }
    const startMs = new Date(params.startTime).getTime()
    const endMs = new Date(params.endTime).getTime()
    if (isNaN(startMs) || isNaN(endMs)) {
      res.status(400).json({
        errors: [
          {
            message: `第 ${i + 1} 条活动的时间格式错误`
          }
        ]
      })
      return
    }
    eventtypeIdSet.add(String(params.eventtype))
    if (startMs < minStartMs) {
      minStartMs = startMs
    }
    if (endMs > maxEndMs) {
      maxEndMs = endMs
    }
    candidateList.push({
      index: typeof item.index === 'number' ? item.index : i,
      eventtypeId: String(params.eventtype),
      startDayIndex: getLocalDayIndex(startMs, offsetMs),
      endDayIndex: getLocalDayIndex(endMs, offsetMs)
    })
  }

  try {
    // 计算检索区间：最小开始时间所在「本地日 00:00:00」~ 最大结束时间所在「本地日 23:59:59」
    const minStartDayIndex = getLocalDayIndex(minStartMs, offsetMs)
    const maxEndDayIndex = getLocalDayIndex(maxEndMs, offsetMs)
    const queryStartUTC = new Date(minStartDayIndex * ONE_DAY_MS - offsetMs)
    const queryEndUTC = new Date(
      maxEndDayIndex * ONE_DAY_MS + (ONE_DAY_MS - 1000) - offsetMs
    )

    // 一次性查询同活动类型、且时间区间与整体范围有交集的已有活动
    const existList = await eventUtils.find(
      {
        eventtype: { $in: Array.from(eventtypeIdSet) },
        startTime: { $lte: queryEndUTC },
        endTime: { $gte: queryStartUTC }
      },
      { startTime: 1 },
      '_id title startTime endTime status eventtype content urlList'
    )

    // 以「活动类型|开始日|结束日」为键，建立已有活动索引
    const existMap = new Map()
    existList.forEach(item => {
      const eventtypeData = item.eventtype || {}
      const eventtypeId = eventtypeData._id
        ? String(eventtypeData._id)
        : String(item.eventtype)
      const startDayIndex = getLocalDayIndex(
        new Date(item.startTime).getTime(),
        offsetMs
      )
      const endDayIndex = getLocalDayIndex(
        new Date(item.endTime).getTime(),
        offsetMs
      )
      const key = `${eventtypeId}|${startDayIndex}|${endDayIndex}`
      if (!existMap.has(key)) {
        existMap.set(key, [])
      }
      existMap.get(key).push({
        _id: item._id,
        title: item.title,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        content: item.content || '',
        urlList: Array.isArray(item.urlList) ? item.urlList : [],
        eventtypeName: eventtypeData.name || '',
        eventtypeColor: eventtypeData.color || ''
      })
    })

    // 为每条候选匹配重合的已有活动
    const duplicates = {}
    candidateList.forEach(candidate => {
      const key = `${candidate.eventtypeId}|${candidate.startDayIndex}|${candidate.endDayIndex}`
      const matched = existMap.get(key)
      if (matched && matched.length > 0) {
        duplicates[candidate.index] = matched
      }
    })

    res.send({
      data: {
        duplicates
      }
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '活动重复预检失败'
        }
      ]
    })
    adminApiLog.error(`event check duplicate fail, ${logErrorToText(err)}`)
  }
}
