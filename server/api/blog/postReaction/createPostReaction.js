const postReactionUtils = require('../../../mongodb/utils/postReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const postUtils = require('../../../mongodb/utils/posts')
const userApiLog = log4js.getLogger('userApi')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const reactionEmojis = require('../../../config/reactionEmojis')

module.exports = async function (req, res, next) {
  const ip = utils.getUserIp(req)
  utils
    .executeInLock('createPostReaction', async () => {
      const { siteLogIPBlockList } = global.$globalConfig.IPBlockSettings
      // 校验IP黑名单
      if (siteLogIPBlockList.has(ip)) {
        res.status(400).json({ errors: [{ message: '您已被禁止操作' }] })
        console.info(`post reaction block by ip:${ip}`)
        return
      }

      const isSearchEngineResult = utils.isSearchEngine(req)
      if (isSearchEngineResult.isBot) {
        res.status(400).json({ errors: [{ message: '您已被禁止操作' }] })
        return
      }

      const { isExceedMaxSize } = await utils.getReaderlogsSize()
      if (isExceedMaxSize) {
        res.status(400).json({ errors: [{ message: '操作失败，请稍后再试' }] })
        throw new Error('readerlogs超出最大存储容量')
      }
      const { emoji, id, __v } = req.body
      const uuid = req.headers['wmb-request-id']

      const filter = {
        post: id,
        uuid
      }
      // 判断id是否符合格式
      if (!utils.isObjectId(id)) {
        res.status(400).json({
          errors: [{ message: '更新失败，id格式错误' }]
        })
        return
      }

      // 校验emoji是否在允许列表中
      if (!reactionEmojis.includes(emoji)) {
        res.status(400).json({
          errors: [{ message: '不支持的表情' }]
        })
        return
      }

      // 校验格式
      const params = {
        emoji,
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
      // 根据ip或uuid查询当天反应操作数量
      const readerlogCount = await readerlogUtils.count({
        $or: [{ uuid: uuid }, { ip: ip }],
        action: { $in: ['postReaction'] },
        createdAt: {
          $gte: utils.getTodayStartTime(),
          $lte: utils.getTodayEndTime()
        }
      })
      if (readerlogCount >= 1000) {
        res.status(400).json({
          errors: [{ message: '到达今日操作上限' }]
        })
        return
      }
      const oldData = await postReactionUtils.findOne(
        filter,
        '_id post emoji __v'
      )
      if (oldData) {
        if (oldData.__v !== __v) {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          return
        }
        // 如果emoji相同，不需要更新
        if (oldData.emoji === emoji) {
          res.send({ data: oldData })
          return
        }
      }

      // 查询post
      const post = await postUtils.findOne(
        { _id: id },
        'title excerpt type'
      )
      if (!post) {
        res.status(400).json({
          errors: [{ message: '更新失败' }]
        })
        return
      }

      let data = null
      params.ipInfo = await utils.IP2LocationUtils(ip, null, null, false)
      if (oldData) {
        // 如果oldData存在，则更新
        const newFilter = { ...filter, __v }
        const updateRes = await postReactionUtils.updateOne(newFilter, params)
        if (!updateRes || updateRes.modifiedCount === 0) {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          return
        }
        data = await postReactionUtils.findOne(filter, '_id post emoji __v')
      } else {
        // 如果oldData不存在，则创建
        const newParams = { ...params, post: id, uuid }
        data = await postReactionUtils.save(newParams).catch(err => {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          userApiLog.error(`postReaction create fail, ${logErrorToText(err)}`)
          return
        })
      }
      if (!data) {
        res.status(400).json({
          errors: [{ message: '更新失败' }]
        })
        return
      }

      const sendData = {}
      sendData._id = data._id
      sendData.post = data.post
      sendData.emoji = data.emoji
      sendData.__v = data.__v
      res.send({ data: sendData })
      userApiLog.info(`postReaction create success`)

      let content = post.title || post.excerpt
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
        action: 'postReaction',
        data: {
          target: target,
          targetId: id,
          content: content
        },
        ...isSearchEngineResult,
        deviceInfo: params.deviceInfo,
        ipInfo: params.ipInfo,
        ip: ip
      }
      readerlogUtils
        .save(readerlogParams)
        .then(data => {
          userApiLog.info(`post reaction log create success`)
        })
        .catch(err => {
          userApiLog.error(`post reaction log create fail, ${logErrorToText(err)}`)
        })
    })
    .then(() => {
      console.info('postReaction unlock')
    })
    .catch(err => {
      userApiLog.error(`postReaction unlock error, ${logErrorToText(err)}`)
    })
}
