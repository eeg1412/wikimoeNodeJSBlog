const postReactionUtils = require('../../../mongodb/utils/postReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const postIdList = req.body.postIdList
  const uuid = req.headers['wmb-request-id']
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  // 校验postIdList
  if (!Array.isArray(postIdList) || postIdList.length === 0) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  try {
    // 聚合查询：按post和emoji分组统计数量
    const mongoose = require('mongoose')
    const objectIdList = postIdList
      .filter(id => utils.isObjectId(id))
      .map(id => new mongoose.Types.ObjectId(id))

    const aggregateResult = await postReactionUtils.aggregate([
      { $match: { post: { $in: objectIdList } } },
      {
        $group: {
          _id: { post: '$post', emoji: '$emoji' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.post',
          reactions: {
            $push: {
              emoji: '$_id.emoji',
              count: '$count'
            }
          }
        }
      }
    ])

    // 查询当前用户的反应
    const userReactions = await postReactionUtils.find(
      { post: { $in: objectIdList }, uuid },
      { _id: -1 },
      '_id post emoji __v'
    )

    res.send({
      reactionList: aggregateResult,
      userReactions: userReactions
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '反应列表获取失败' }]
    })
    userApiLog.error(`postReaction list get fail, ${JSON.stringify(err)}`)
  }
}
