const blogCachesUtils = require('../../../mongodb/utils/blogCaches')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  await blogCachesUtils.deleteMany({})

  adminApiLog.info('删除blogCache成功')


  res.send({
  })
}
