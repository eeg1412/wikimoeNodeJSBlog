const commentLikeLogUtils = require('../../../mongodb/utils/commentLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const commentUtils = require('../../../mongodb/utils/comments')
const userApiLog = log4js.getLogger('userApi')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')

module.exports = async function (req, res, next) {

  const { like, id, __v } = req.body
  const uuid = req.headers['x-request-id']
  const ip = utils.getUserIp(req)
  const filter = {
    comment: id,
    uuid,
  }
  // 判断id是否符合格式
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{
        message: '更新失败，id格式错误'
      }]
    })
    return
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
  // 根据ip或uuid， 查询 readerlogUtils.count 中action字段 commentLike 或 postDislike 当天的数据量是否超过1000条
  const readerlogCount = await readerlogUtils.count({
    $or: [
      {
        uuid: uuid
      },
      {
        ip: ip
      }
    ],
    // action字段 commentLike 或 commentDislike
    action: {
      $in: ['commentLike', 'commentDislike']
    },
    createdAt: {
      $gte: utils.getTodayStartTime(),
      $lte: utils.getTodayEndTime()
    }
  })
  if (readerlogCount >= 1000) {
    res.status(400).json({
      errors: [{
        message: '到达今日点赞上限'
      }]
    })
    return
  }
  const oldData = await commentLikeLogUtils.findOne(filter, '_id comment like __v')
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
    const updateRes = await commentLikeLogUtils.updateOne(newFilter, params)
    if (!updateRes || updateRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    data = await commentLikeLogUtils.findOne(filter, '_id comment like __v')

  } else {
    // 如果oldData不存在，则创建
    const newParams = {
      ...params,
      comment: id,
      uuid,
    }
    data = await commentLikeLogUtils.save(newParams).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      userApiLog.error(`commentLikeLog create fail, ${JSON.stringify(err)}`)
      return
    })
  }
  if (!data) {
    return
  }

  const sendData = {}
  // 只要_id,comment,like,__v
  sendData._id = data._id
  sendData.comment = data.comment
  sendData.like = data.like
  sendData.__v = data.__v
  res.send({
    data: sendData
  })
  userApiLog.info(`commentLikeLog create success`)
  // 异步更新文章点赞数
  let likes = 0
  if (like) {
    likes = 1
  } else {
    likes = -1
  }
  commentUtils.updateOne({ _id: id }, { $inc: { likes: likes } }, true)
  // 查询comment
  const comment = await commentUtils.findOne({ _id: id }, 'content')
  let content = comment.content
  // 控制content长度在20字，超过...
  if (content.length > 20) {
    content = content.substring(0, 20) + '...'
  }
  const readerlogParams = {
    uuid: uuid,
    action: like ? 'commentLike' : 'commentDislike',
    data: {
      target: 'comment',
      targetId: id,
      content: content,
    },
    ...utils.isSearchEngine(req),
    deviceInfo: params.deviceInfo,
    ipInfo: params.ipInfo,
    ip: ip
  }
  readerlogUtils.save(readerlogParams).then((data) => {
    userApiLog.info(`comment like log create success`)
  }).catch((err) => {
    userApiLog.error(`comment like log create fail, ${JSON.stringify(err)}`)
  })
}

