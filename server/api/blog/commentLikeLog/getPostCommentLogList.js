const commentLikeLogUtils = require('../../../mongodb/utils/commentLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  // 获取id列表
  const commentIdList = req.body.commentIdList
  const uuid = req.headers['wmb-request-id']
  const ip = utils.getUserIp(req)
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误',
        },
      ],
    })
    return
  }

  const params = {
    comment: {
      $in: commentIdList,
    },
    // 判断uuid
    uuid,
  }

  const sort = {
    _id: -1,
  }
  commentLikeLogUtils
    .find(params, sort, '_id comment like __v')
    .then((data) => {
      res.send({
        list: data,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '文章点赞记录列表获取失败',
          },
        ],
      })
      userApiLog.error(`commentLikeLog list get fail, ${JSON.stringify(err)}`)
    })
}
