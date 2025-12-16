const emailSendHistoryUtils = require('../../../mongodb/utils/emailSendHistorys')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, to, status } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size
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
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({
      errors: queryErrors
    })
    return
  }
  const params = {}
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.content = new RegExp(keyword, 'i')
  }
  if (to) {
    to = utils.escapeSpecialChars(to)
    params.to = new RegExp(to, 'i')
  }
  if (status) {
    params.status = Number(status)
  }

  const sort = {
    _id: -1
  }
  emailSendHistoryUtils
    .findPage(params, sort, page, size)
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
            message: '邮件发送记录列表获取失败'
          }
        ]
      })
      adminApiLog.error(
        `emailSendHistory list get fail, ${JSON.stringify(err)}`
      )
    })
}
