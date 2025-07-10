const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  // 获取id列表
  const postIdList = req.body.postIdList
  const uuid = req.headers['wmb-request-id']
  const ip = utils.getUserIp(req)
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }

  const params = {
    post: {
      $in: postIdList
    },
    // 判断uuid
    uuid
  }

  const sort = {
    _id: -1
  }
  postLikeLogUtils
    .find(params, sort, '_id post like __v')
    .then(data => {
      res.send({
        list: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '文章点赞记录列表获取失败'
          }
        ]
      })
      userApiLog.error(`postLikeLog list get fail, ${JSON.stringify(err)}`)
    })
}
