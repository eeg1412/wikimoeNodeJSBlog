const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, eventtype, status } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size,
    keyword,
    eventtype,
    status
  }
  const queryRule = [
    {
      key: 'page',
      label: '页数',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'size',
      label: '每页数量',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'keyword',
      label: '关键词',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'eventtype',
      label: '活动类型',
      type: 'isMongoId',
      required: false
    },
    {
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: false
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({ errors: queryErrors })
    return
  }
  const params = {}
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.$or = [
      { title: new RegExp(keyword, 'i') },
      { content: new RegExp(keyword, 'i') }
    ]
  }
  // 如果eventtype存在，就加入查询条件
  if (eventtype) {
    if (!utils.isObjectId(eventtype)) {
      res.status(400).json({
        errors: [
          {
            message: 'eventtype格式错误'
          }
        ]
      })
      return
    }
    params.eventtype = eventtype
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = status
  }

  const sort = {
    startTime: -1,
    _id: -1
  }
  eventUtils
    .findPage(params, sort, page, size, '-content')
    .then(data => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '活动列表获取失败'
          }
        ]
      })
      adminApiLog.error(`event list get fail, ${JSON.stringify(err)}`)
    })
}
