const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const postUtils = require('../../../mongodb/utils/posts')
const userApiLog = log4js.getLogger('userApi')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')

module.exports = async function (req, res, next) {
  utils
    .executeInLock('createPostLikeLog', async () => {
      const { isExceedMaxSize } = await utils.getReaderlogsSize()
      if (isExceedMaxSize) {
        res.status(400).json({ errors: [{ message: '点赞失败，请稍后再试' }] })
        throw new Error('readerlogs超出最大存储容量')
      }
      const { isExceedMaxSize: isExceedMaxSizePostLike } =
        await utils.getPostLikeLogsSize()
      if (isExceedMaxSizePostLike) {
        res.status(400).json({ errors: [{ message: '点赞失败，请稍后再试' }] })
        throw new Error('postLikeLogs超出最大存储容量')
      }
      const { like, id, __v } = req.body
      const uuid = req.headers['wmb-request-id']
      const ip = utils.getUserIp(req)
      const filter = {
        post: id,
        uuid
      }
      // 判断id是否符合格式
      if (!utils.isObjectId(id)) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败，id格式错误'
            }
          ]
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
          options: 4,
          required: true
        }
      ]
      const errors = utils.checkForm(params, rule)
      if (errors.length > 0) {
        res.status(400).json({ errors })
        return
      }
      // 根据ip或uuid， 查询 readerlogUtils.count 中action字段 postLike 或 postDislike 当天的数据量是否超过1000条
      const readerlogCount = await readerlogUtils.count({
        $or: [
          {
            uuid: uuid
          },
          {
            ip: ip
          }
        ],
        // action字段 postLike 或 postDislike
        action: {
          $in: ['postLike', 'postDislike']
        },
        createdAt: {
          $gte: utils.getTodayStartTime(),
          $lte: utils.getTodayEndTime()
        }
      })
      if (readerlogCount >= 1000) {
        res.status(400).json({
          errors: [
            {
              message: '到达今日点赞上限'
            }
          ]
        })
        return
      }
      const oldData = await postLikeLogUtils.findOne(
        filter,
        '_id post like __v'
      )
      let oldLike = null
      if (oldData) {
        if (oldData.__v !== __v) {
          res.status(400).json({
            errors: [
              {
                message: '更新失败'
              }
            ]
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
          errors: [
            {
              message: '取消点赞失败'
            }
          ]
        })
        return
      }

      let data = null
      // 查询post
      const post = await postUtils.findOne(
        { _id: id },
        'title excerpt type likes'
      )
      if (!post) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      // likes 如果大于 2000000000(20亿)，返回错误
      if (post.likes + 1 > 2000000000 && like) {
        res.status(400).json({
          errors: [
            {
              message: '已超过最大点赞数'
            }
          ]
        })
        return
      }
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
            errors: [
              {
                message: '更新失败'
              }
            ]
          })
          return
        }
        data = await postLikeLogUtils.findOne(filter, '_id post like __v')
      } else {
        // 如果oldData不存在，则创建
        const newParams = {
          ...params,
          post: id,
          uuid
        }
        data = await postLikeLogUtils.save(newParams).catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '更新失败'
              }
            ]
          })
          userApiLog.error(`postLikeLog create fail, ${logErrorToText(err)}`)
          return
        })
      }
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
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

      let content = post.title || post.excerpt
      // 控制content长度在20字，超过...
      if (content.length > 20) {
        content = content.substring(0, 20) + '...'
      }
      let target = null
      switch (post.type) {
        case 1:
          target = 'blog'
          break
        case 2:
          target = 'tweet'
          break
        case 3:
          target = 'page'
          break

        default:
          break
      }
      const readerlogParams = {
        uuid: uuid,
        action: like ? 'postLike' : 'postDislike',
        data: {
          target: target,
          targetId: id,
          content: content
        },
        ...utils.isSearchEngine(req),
        deviceInfo: params.deviceInfo,
        ipInfo: params.ipInfo,
        ip: ip
      }
      readerlogUtils
        .save(readerlogParams)
        .then(data => {
          // utils.reflushBlogCache()
          userApiLog.info(`post like log create success`)
        })
        .catch(err => {
          userApiLog.error(`post like log create fail, ${logErrorToText(err)}`)
        })
    })
    .then(() => {
      console.info('postLikeLog unlock')
    })
    .catch(err => {
      userApiLog.error(`postLikeLog unlock error, ${logErrorToText(err)}`)
    })
}
