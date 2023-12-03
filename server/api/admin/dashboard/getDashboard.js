const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const attachmentUtils = require('../../../mongodb/utils/attachments')
const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const os = require('os')


module.exports = async function (req, res, next) {
  // 1. 获取评论总数
  const commentCount = await commentUtils.count({})
  // 获取未审核评论总数
  const unAuditCommentCount = await commentUtils.count({ status: 0 })
  // 2. 获取附件总数
  const attachmentCount = await attachmentUtils.count({})
  // 3. 获取文章总数
  const postCount = await postUtils.count({})
  // JSON_LIMT="50mb"
  // URLENCODED_LIMT="50mb"
  // 返回以上数据
  const jsonLimit = process.env.JSON_LIMT || '10mb'
  const urlencodedLimit = process.env.URLENCODED_LIMT || '10mb'
  // 获取nodejs版本
  const nodeVersion = process.version
  // 获取系统信息
  const platform = os.platform()
  const release = os.release()
  const hostname = os.hostname()
  const cpus = os.cpus()
  const cpu = cpus[0].model
  const memory = os.totalmem()
  const arch = os.arch()
  const uptime = os.uptime()


  // send
  res.send({
    data: {
      commentCount,
      unAuditCommentCount,
      attachmentCount,
      postCount,
      jsonLimit,
      urlencodedLimit,
      nodeVersion,
      platform,
      release,
      hostname,
      cpu,
      memory,
      arch,
      uptime
    }
  })
}
