const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, ip, uuid } = req.query
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

  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (uuid) {
    uuid = utils.escapeSpecialChars(uuid)
    params.uuid = new RegExp(uuid, 'i')
  }


  const sort = {
    _id: -1
  }
  readerlogUtils.findPage(params, sort, page, size).then((data) => {
    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '读者访问日志列表获取失败'
      }]
    })
    adminApiLog.error(`readerlog list get fail, ${JSON.stringify(err)
      }`)
  })
}
