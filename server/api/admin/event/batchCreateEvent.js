const eventUtils = require('../../../mongodb/utils/events')
const eventtypeUtils = require('../../../mongodb/utils/eventtypes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

// 单条活动的校验规则
const eventRule = [
  {
    key: 'eventtype',
    label: '活动类型',
    type: 'isMongoId',
    required: true
  },
  {
    key: 'title',
    label: '活动名称',
    type: null,
    required: true,
    strict: true,
    strictType: 'string'
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
  },
  {
    key: 'status',
    label: '状态',
    strict: true,
    strictType: 'number'
  }
]

module.exports = async function (req, res, next) {
  const { list } = req.body
  // 校验 list 是否为数组
  if (!Array.isArray(list) || list.length === 0) {
    res.status(400).json({
      errors: [
        {
          message: '导入数据格式错误，必须是非空数组'
        }
      ]
    })
    return
  }
  // 限制单次导入的最大数量，避免一次性写入过多数据
  const MAX_IMPORT_COUNT = 200
  if (list.length > MAX_IMPORT_COUNT) {
    res.status(400).json({
      errors: [
        {
          message: `单次最多导入 ${MAX_IMPORT_COUNT} 条活动`
        }
      ]
    })
    return
  }

  // 逐条校验
  const eventtypeIdSet = new Set()
  const saveList = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const params = {
      eventtype: item.eventtype,
      title: item.title,
      color: item.color || null,
      urlList: item.urlList,
      content: item.content || '',
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status
    }
    const errors = utils.checkForm(params, eventRule)
    if (errors.length > 0) {
      res.status(400).json({
        errors: [
          {
            message: `第 ${i + 1} 条活动校验失败：${errors[0].message}`
          }
        ]
      })
      return
    }
    // urlList 检查
    if (params.urlList === undefined || params.urlList === null) {
      params.urlList = []
    }
    if (!utils.checkStringList(params.urlList, ['text', 'url'])) {
      res.status(400).json({
        errors: [
          {
            message: `第 ${i + 1} 条活动的链接列表格式错误`
          }
        ]
      })
      return
    }
    // 校验结束时间是否在开始时间之后
    if (new Date(params.endTime) < new Date(params.startTime)) {
      res.status(400).json({
        errors: [
          {
            message: `第 ${i + 1} 条活动的结束时间不能在开始时间之前`
          }
        ]
      })
      return
    }
    eventtypeIdSet.add(String(params.eventtype))
    saveList.push(params)
  }

  // 校验所有活动类型是否真实存在
  try {
    const eventtypeIdList = Array.from(eventtypeIdSet)
    const existEventtypeList = await eventtypeUtils.find(
      { _id: { $in: eventtypeIdList } },
      {},
      '_id'
    )
    const existEventtypeIdSet = new Set(
      existEventtypeList.map(item => String(item._id))
    )
    for (let i = 0; i < eventtypeIdList.length; i++) {
      if (!existEventtypeIdSet.has(eventtypeIdList[i])) {
        res.status(400).json({
          errors: [
            {
              message: '存在不合法的活动类型，请检查导入数据'
            }
          ]
        })
        return
      }
    }
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '活动类型校验失败'
        }
      ]
    })
    adminApiLog.error(
      `event batch create check eventtype fail, ${logErrorToText(err)}`
    )
    return
  }

  // 批量保存
  try {
    const data = await eventUtils.insertMany(saveList)
    res.send({
      data: {
        count: data.length
      }
    })
    adminApiLog.info(`event batch create success, count: ${data.length}`)
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '活动批量创建失败'
        }
      ]
    })
    adminApiLog.error(`event batch create fail, ${logErrorToText(err)}`)
  }
}
