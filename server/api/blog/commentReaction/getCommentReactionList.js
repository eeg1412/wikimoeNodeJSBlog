const commentReactionUtils = require('../../../mongodb/utils/commentReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const commentIdList = req.body.commentIdList
  const uuid = req.headers['wmb-request-id']
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  if (!Array.isArray(commentIdList) || commentIdList.length === 0) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  if (commentIdList.length > 50) {
    res.status(400).json({
      errors: [{ message: '查询数量超出限制' }]
    })
    return
  }

  try {
    const mongoose = require('mongoose')
    const objectIdList = commentIdList
      .filter(id => utils.isObjectId(id))
      .map(id => new mongoose.Types.ObjectId(id))

    const aggregateResult = await commentReactionUtils.aggregate([
      { $match: { comment: { $in: objectIdList } } },
      {
        $group: {
          _id: { comment: '$comment', emoji: '$emoji' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.comment',
          reactions: {
            $push: {
              emoji: '$_id.emoji',
              count: '$count'
            }
          }
        }
      }
    ])

    const userReactions = await commentReactionUtils.find(
      { comment: { $in: objectIdList }, uuid },
      { _id: -1 },
      '_id comment emoji __v'
    )

    res.send({
      reactionList: aggregateResult,
      userReactions: userReactions
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '反应列表获取失败' }]
    })
    userApiLog.error(`commentReaction list get fail, ${JSON.stringify(err)}`)
  }
}
