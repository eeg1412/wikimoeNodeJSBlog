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
  const pipeline = [
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: "$likes" },
        blogCount: {
          $sum: {
            $cond: [{ $eq: ["$type", 1] }, 1, 0]
          }
        },
        tweetCount: {
          $sum: {
            $cond: [{ $eq: ["$type", 2] }, 1, 0]
          }
        },
        pageCount: {
          $sum: {
            $cond: [{ $eq: ["$type", 3] }, 1, 0]
          }
        }
      }
    }
  ];

  let postCount = {
    totalViews: 0,
    totalLikes: 0,
    blogCount: 0,
    tweetCount: 0,
    pageCount: 0
  }
  const postCountRes = await postUtils.aggregate(pipeline)
  if (postCountRes.length > 0) {
    postCount = postCountRes[0]
    // 删除_id
    delete postCount._id
  }
  // JSON_LIMIT="50mb"
  // URLENCODED_LIMIT="50mb"
  // 返回以上数据
  const jsonLimit = process.env.JSON_LIMIT || '10mb'
  const urlencodedLimit = process.env.URLENCODED_LIMIT || '10mb'
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
