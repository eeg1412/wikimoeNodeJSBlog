const commentReactionUtils = require('../../../mongodb/utils/commentReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  // 获取id列表
  const commentIdList = req.body.commentIdList
  const uuid = req.headers['wmb-request-id']
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  const params = {
    comment: {
      $in: commentIdList
    },
    uuid
  }

  const sort = {
    _id: -1
  }
  commentReactionUtils
    .find(params, sort, '_id comment emoji __v')
    .then(data => {
      res.send({
        list: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [{ message: '反应记录列表获取失败' }]
      })
      userApiLog.error(`commentReaction list get fail, ${JSON.stringify(err)}`)
    })
}
