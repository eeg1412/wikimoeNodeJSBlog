const commentLikeLogUtils = require('../../../mongodb/utils/commentLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const stats = await utils.getCommentLikeLogsSize()
  res.send({
    stats
  })
}
