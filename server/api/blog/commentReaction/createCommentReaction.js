const commentReactionUtils = require('../../../mongodb/utils/commentReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const commentUtils = require('../../../mongodb/utils/comments')
const userApiLog = log4js.getLogger('userApi')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const reactionEmojis = require('../../../config/reactionEmojis')

module.exports = async function (req, res, next) {
  const ip = utils.getUserIp(req)
  utils
    .executeInLock('createCommentReaction', async () => {
      const { siteLogIPBlockList } = global.$globalConfig.IPBlockSettings
      if (siteLogIPBlockList.has(ip)) {
        res.status(400).json({ errors: [{ message: '您已被禁止操作' }] })
        console.info(`comment reaction block by ip:${ip}`)
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

      const filter = { comment: id, uuid }
      if (!utils.isObjectId(id)) {
        res.status(400).json({
          errors: [{ message: '更新失败，id格式错误' }]
        })
        return
      }

      // 校验emoji
      if (!reactionEmojis.includes(emoji)) {
        res.status(400).json({
          errors: [{ message: '不支持的表情' }]
        })
        return
      }

      const params = {
        emoji,
        uuid,
        ip: ip,
        deviceInfo: utils.deviceUAInfoUtils(req),
        date: new Date()
      }
      const rule = [
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

      const readerlogCount = await readerlogUtils.count({
        $or: [{ uuid: uuid }, { ip: ip }],
        action: { $in: ['commentReaction'] },
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

      const oldData = await commentReactionUtils.findOne(
        filter,
        '_id comment emoji __v'
      )
      if (oldData) {
        if (oldData.__v !== __v) {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          return
        }
        if (oldData.emoji === emoji) {
          res.send({ data: oldData })
          return
        }
      }

      // 查询comment
      const comment = await commentUtils.findOne(
        { _id: id, status: 1 },
        'content _id status'
      )
      if (!comment) {
        res.status(400).json({
          errors: [{ message: '更新失败' }]
        })
        return
      }

      let data = null
      params.ipInfo = await utils.IP2LocationUtils(ip, null, null, false)
      if (oldData) {
        const newFilter = { ...filter, __v }
        const updateRes = await commentReactionUtils.updateOne(newFilter, params)
        if (!updateRes || updateRes.modifiedCount === 0) {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          return
        }
        data = await commentReactionUtils.findOne(filter, '_id comment emoji __v')
      } else {
        const newParams = { ...params, comment: id, uuid }
        data = await commentReactionUtils.save(newParams).catch(err => {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          userApiLog.error(`commentReaction create fail, ${logErrorToText(err)}`)
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
      sendData.comment = data.comment
      sendData.emoji = data.emoji
      sendData.__v = data.__v
      res.send({ data: sendData })
      userApiLog.info(`commentReaction create success`)

      let content = comment.content
      if (content.length > 20) {
        content = content.substring(0, 20) + '...'
      }
      const readerlogParams = {
        uuid: uuid,
        action: 'commentReaction',
        data: {
          target: 'comment',
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
          userApiLog.info(`comment reaction log create success`)
        })
        .catch(err => {
          userApiLog.error(`comment reaction log create fail, ${logErrorToText(err)}`)
        })
    })
    .then(() => {
      console.info('commentReaction unlock')
    })
    .catch(err => {
      userApiLog.error(`commentReaction unlock error, ${logErrorToText(err)}`)
    })
}
