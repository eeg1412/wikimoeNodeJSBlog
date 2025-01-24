const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const userApiLog = log4js.getLogger('userApi')
const postUtils = require('../../../mongodb/utils/posts')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  utils.executeInLock('commentRetract', async () => {
    const id = req.body.id
    const uuid = req.headers['wmb-request-id']
    const ip = utils.getUserIp(req)
    const min5 = 300000 // 5分钟
    const commentRetractAuthDecode = req['commentRetractAuthDecode']
    if (!commentRetractAuthDecode) {
      res.status(400).json({
        errors: [{
          message: '撤回失败，认证信息已过期'
        }],
        code: 401
      })
      return
    }
    // 判断id是否符合格式
    if (!utils.isObjectId(id)) {
      res.status(400).json({
        errors: [{
          message: '撤回失败，id格式错误'
        }]
      })
      return
    }
    // 判断uuid是否符合格式
    if (!utils.isUUID(uuid)) {
      res.status(400).json({
        errors: [{
          message: '参数错误'
        }]
      })
      return
    }

    const decodeCommentList = commentRetractAuthDecode?.commentList || []
    const currComment = decodeCommentList.find(item => item.id === id)
    if (!currComment) {
      res.status(400).json({
        errors: [{
          message: '撤回失败，该评论不存在或者不可以撤回'
        }]
      })
      return
    }
    // 查看 currComment的date是否超过5分钟
    try {
      const currDate = new Date(currComment.date)
      const nowDate = new Date()
      const diff = nowDate - currDate
      if (diff > min5) {
        res.status(400).json({
          errors: [{
            message: '撤回失败，评论已超过5分钟'
          }]
        })
        return
      }
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '撤回失败，评论时间错误'
        }]
      })
      return
    }

    // 根据ip或uuid， 查询 readerlogUtils.count 中action字段 commentRetract 当天的数据量是否超过
    const siteCommentRetractLimit = global.$globalConfig?.commentSettings?.siteCommentRetractLimit || 0
    if (siteCommentRetractLimit <= 0) {
      res.status(400).json({
        errors: [{
          message: '当前禁止撤回评论'
        }]
      })
      return
    }
    const todayStartTime = utils.getTodayStartTime()
    const todayEndTime = utils.getTodayEndTime()
    const readerlogCount = await readerlogUtils.count({
      $or: [
        {
          uuid: uuid
        },
        {
          ip: ip
        }
      ],
      action: 'commentRetract',
      createdAt: {
        $gte: todayStartTime,
        $lte: todayEndTime
      }
    })
    const commentRetractCountData = {
      count: readerlogCount,
      todayStartTime: todayStartTime,
      todayEndTime: todayEndTime
    }
    if (readerlogCount >= siteCommentRetractLimit) {
      res.status(400).json({
        errors: [{
          message: '已到达今日撤回上限'
        }],
        commentRetractCountData
      })
      return
    }

    // 删除评论
    const fiveMinutesAgo = new Date(Date.now() - min5)
    commentUtils.findOneAndDelete({
      _id: id,
      date: { $gte: fiveMinutesAgo }
    }).then(async (comment) => {
      // 判断是否删除成功
      if (!comment) {
        res.status(400).json({
          errors: [{
            message: '该评论暂时无法撤回'
          }]
        })
        userApiLog.error(`comment retract fail, comment not exist`)
        return
      }

      // 更新文章评论数
      const status = comment.status
      if (status === 1) {
        // 异步更新文章评论数
        await postUtils.updateOne({ _id: comment.post }, { $inc: { comnum: -1 } }, true)
        cacheDataUtils.getCommentList()
        // utils.reflushBlogCache()
      }
      // 返回成功
      commentRetractCountData.count++
      res.send({
        data: {
          message: '撤回成功'
        },
        commentRetractCountData
      })
      userApiLog.info(`comment retract success`)
      // 发送邮件
      const postInfo = await postUtils.findOne({ _id: comment.post })
      utils.sendRetractCommentNotice(postInfo, comment)

      // 记录日志
      let content = comment.content
      // 控制content长度在20字，超过...
      if (content.length > 20) {
        content = utils.limitStr(content, 20)
      }
      const params = {
        uuid: uuid,
        action: 'commentRetract',
        data: {
          content: content,
        },
        ...utils.isSearchEngine(req),
        deviceInfo: utils.deviceUAInfoUtils(req),
        ipInfo: null,
        ip: ip
      }
      const ipInfo = await utils.IP2LocationUtils(ip, null, null, false)
      params.ipInfo = ipInfo
      readerlogUtils.save(params)
    })
  })
    .then(() => {
      // 释放锁
      console.info('commentRetract unlock')
    }).catch((err) => {
      // 释放锁
      userApiLog.error(`commentRetract unlock error, ${logErrorToText(err)}`)
    })
}