const userLoginLogsUtils = require('../../../mongodb/utils/userLoginLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, username, ip, success } = req.query
  page = parseInt(page)
  size = parseInt(size)
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }
  const params = {}

  if (username) {
    username = utils.escapeSpecialChars(username)
    params.username = new RegExp(username, 'i')
  }
  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (success === '0' || success === '1') {
    params.success = success === '1' ? true : false
  }

  const sort = {
    date: -1,
    _id: -1
  }
  userLoginLogsUtils
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
            message: '用户登录日志列表获取失败'
          }
        ]
      })
      adminApiLog.error(`userloginlog list get fail, ${JSON.stringify(err)}`)
    })
}
