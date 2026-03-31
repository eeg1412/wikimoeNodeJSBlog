const postReactionUtils = require('../../../mongodb/utils/postReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  // 获取id列表
  const postIdList = req.body.postIdList
  const uuid = req.headers['wmb-request-id']
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  const params = {
    post: {
      $in: postIdList
    },
    uuid
  }

  const sort = {
    _id: -1
  }
  postReactionUtils
    .find(params, sort, '_id post emoji __v')
    .then(data => {
      res.send({
        list: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [{ message: '反应记录列表获取失败' }]
      })
      userApiLog.error(`postReaction list get fail, ${JSON.stringify(err)}`)
    })
}
