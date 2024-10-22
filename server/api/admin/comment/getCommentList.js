const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, ip, uuid, status } = req.query
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
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.$or = [
      { content: new RegExp(keyword, 'i') },
      { nickname: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') },
      { url: new RegExp(keyword, 'i') }
    ]
  }
  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (uuid) {
    uuid = utils.escapeSpecialChars(uuid)
    params.uuid = new RegExp(uuid, 'i')
  }
  // 因为是query，所以要转换成数字
  if (status) {
    params.status = Number(status)
  }
  const sort = {
    date: -1
  }
  commentUtils.findPage(params, sort, page, size).then((data) => {
    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '评论列表获取失败'
      }]
    })
    adminApiLog.error(`comment list get fail, ${logErrorToText(err)}`)
  })
}
