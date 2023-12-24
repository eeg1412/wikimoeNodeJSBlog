const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const postUtils = require('../../../mongodb/utils/posts')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {

  const { like, id, __v } = req.body
  const uuid = req.headers['x-request-id']
  const ip = utils.getUserIp(req)
  const filter = {
    post: id,
    uuid,
  }
  // 校验格式
  const params = {
    like,
    uuid,
    ip: ip,
    deviceInfo: utils.deviceUAInfoUtils(req),
    date: new Date()
  }
  const rule = [
    // uuid
    {
      key: 'uuid',
      label: '内容参数',
      type: 'isUUID',
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  const oldData = await postLikeLogUtils.findOne(filter, '_id post like __v')
  let oldLike = null
  if (oldData) {
    if (oldData.__v !== __v) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    oldLike = oldData.like
    // 如果oldLike和like相等，则不需要更新
    if (oldLike === like) {
      res.send({
        data: oldData
      })
      return
    }
  }
  if (oldLike === null && like === false) {
    // 400
    res.status(400).json({
      errors: [{
        message: '取消点赞失败'
      }]
    })
    return
  }

  let data = null
  params.ipInfo = await utils.IP2LocationUtils(ip, null, null, false)
  if (oldData) {
    // 如果oldData存在，则更新
    // 加上__v
    const newFilter = {
      ...filter,
      __v
    }
    const updateRes = await postLikeLogUtils.updateOne(newFilter, params)
    if (!updateRes || updateRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    data = await postLikeLogUtils.findOne(filter, '_id post like __v')

  } else {
    // 如果oldData不存在，则创建
    const newParams = {
      ...params,
      post: id,
      uuid,
    }
    data = await postLikeLogUtils.save(newParams).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      userApiLog.error(`postLikeLog create fail, ${JSON.stringify(err)}`)
      return
    })
  }
  if (!data) {
    return
  }

  const sendData = {}
  // 只要_id,post,like,__v
  sendData._id = data._id
  sendData.post = data.post
  sendData.like = data.like
  sendData.__v = data.__v
  res.send({
    data: sendData
  })
  userApiLog.info(`postLikeLog create success`)
  // 异步更新文章点赞数
  let likes = 0
  if (like) {
    likes = 1
  } else {
    likes = -1
  }
  postUtils.updateOne({ _id: id }, { $inc: { likes: likes } }, true)



}
