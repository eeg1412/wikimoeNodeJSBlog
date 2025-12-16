const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const {
    eventtype,
    title,
    color,
    urlList,
    content,
    startTime,
    endTime,
    status
  } = req.body
  // 校验格式
  const params = {
    eventtype,
    title,
    color,
    urlList,
    content,
    startTime,
    endTime,
    status
  }
  const rule = [
    // eventtype
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
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  // urlList 检查
  if (!utils.checkStringList(urlList, ['text', 'url'])) {
    res.status(400).json({
      errors: [
        {
          message: '链接列表格式错误'
        }
      ]
    })
    return
  }

  // 校验结束时间是否在开始时间之后
  if (new Date(endTime) < new Date(startTime)) {
    res.status(400).json({
      errors: [
        {
          message: '结束时间不能在开始时间之前'
        }
      ]
    })
    return
  }
  // save
  eventUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`event create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '活动创建失败'
          }
        ]
      })
      adminApiLog.error(`event create fail, ${logErrorToText(err)}`)
    })
}
