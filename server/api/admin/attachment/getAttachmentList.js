
const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, album } = req.query
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
    params.name = new RegExp(keyword, 'i')
  }
  if (album) {
    params.album = album
  }

  // updatedAt越新越靠前，_id越新越靠前
  const sort = {
    updatedAt: -1,
    _id: -1
  }
  attachmentUtils.findPage(params, sort, page, size).then((data) => {
    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '媒体列表获取失败'
      }]
    })
    adminApiLog.error(`attachment list get fail, ${logErrorToText(err)}`)
  })
}
