const emailSendHistoryUtils = require('../../../mongodb/utils/emailSendHistorys')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, to, status } = req.query
  page = parseInt(page)
  size = parseInt(size)
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  const params = {
  }
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
  emailSendHistoryUtils.findPage(params, sort, page, size).then((data) => {
    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '邮件发送记录列表获取失败'
      }]
    })
    adminApiLog.error(`emailSendHistory list get fail, ${JSON.stringify(err)
      }`)
  })
}
