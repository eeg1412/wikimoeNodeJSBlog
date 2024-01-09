const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {

  const { post, parent, content, nickname, email, url } = req.body
  // 如果content超过500个字符，就报错
  if (content?.length > 500) {
    res.status(400).json({
      errors: [{
        message: '评论内容不能超过500个字符'
      }]
    })
    return
  }
  // nickname 20个字符以内
  if (nickname?.length > 20) {
    res.status(400).json({
      errors: [{
        message: '昵称不能超过20个字符'
      }]
    })
    return
  }
  // url 200个字符以内
  if (url?.length > 200) {
    res.status(400).json({
      errors: [{
        message: 'url不能超过200个字符'
      }]
    })
    return
  }
  // email 50个字符以内
  if (email?.length > 100) {
    res.status(400).json({
      errors: [{
        message: '邮箱地址不能超过100个字符'
      }]
    })
    return
  }
  // 获取全局配置
  const { siteEnableComment, siteCommentInterval, siteEnableCommentReview } = global.$globalConfig.commentSettings
  // 如果siteEnableComment为false，则不允许评论
  if (!siteEnableComment) {
    res.status(400).json({
      errors: [{
        message: '评论功能已关闭'
      }]
    })
    return
  }
  // 校验敏感词
  const mint = global.$Mint
  // 如果没有mint，报错
  if (!mint) {
    res.status(400).json({
      errors: [{
        message: '评论发送失败'
      }]
    })
    return
  }
  // 校验敏感词
  const mintRes = mint.verify(content)
  // 如果有敏感词，报错
  if (!mintRes) {
    res.status(400).json({
      errors: [{
        message: '评论内容中有不恰当的词汇，请修改后再试'
      }]
    })
    return
  }
  // 从header中获取uuid
  const uuid = req.headers['x-request-id']


  const ip = utils.getUserIp(req)
  // 校验格式
  const params = {
    post,
    content,
    nickname,
    uuid,
    ip: ip,
    deviceInfo: utils.deviceUAInfoUtils(req),
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false)
  }
  if (email) {
    params.email = email
  }
  if (url) {
    params.url = url
  }
  const rule = [
    {
      key: 'post',
      label: '评论文章',
      type: null,
      required: true,
    },
    {
      key: 'content',
      label: '评论内容',
      type: null,
      required: true,
    },
    {
      key: 'nickname',
      label: '昵称',
      type: null,
      required: true,
    },
    {
      key: 'email',
      label: '邮箱地址',
      type: 'isEmail',
      required: false,
    },
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
  // 获取文章信息
  const postInfo = await postUtils.findOne({ _id: post })
  if (!postInfo) {
    res.status(400).json({
      errors: [{
        message: '文章不存在'
      }]
    })
    return
  }

  // 根据siteCommentInterval（单位秒） 判断该uuid/ip上次的评论时间（date）是否在siteCommentInterval秒内
  if (!siteCommentInterval) {
    res.status(400).json({
      errors: [{
        message: '评论间隔未设置'
      }]
    })
    return
  }
  // 如果为0，则不限制评论间隔
  if (siteCommentInterval !== 0) {
    const now = new Date()
    // 当前时间减去siteCommentInterval秒
    const lastTime = new Date(now.getTime() - siteCommentInterval * 1000)
    const params = {
      $or: [
        { uuid: uuid },
        { ip: ip }
      ],
      date: {
        $gt: lastTime
      }
    }
    const lastComment = await commentUtils.findOne(
      params
    )
    if (lastComment) {
      res.status(400).json({
        errors: [{
          message: '发送的评论过于频繁，请稍后再试'
        }]
      })
      return
    }
  }

  // 根据siteEnableCommentReview判断是否需要审核
  if (siteEnableCommentReview) {
    params.status = 0
  } else {
    params.status = 1
  }

  if (parent) {
    // 校验parent是否是ObjectId
    if (!utils.isObjectId(parent)) {
      res.status(400).json({
        errors: [{
          message: 'parent格式错误'
        }]
      })
      return
    }
    params.parent = parent
  }

  const emailSettings = global.$globalConfig.emailSettings
  const { emailEnable, emailSendOptions } = emailSettings
  // 立即发送flag
  let sendParentMailFlag = false
  //  判断emailEnable为true，且emailSendOptions包含字符串replyComment且包含parent时
  if (emailEnable && emailSendOptions.includes('replyComment') && parent) {
    // 根据siteEnableCommentReview判断是否需要审核
    if (siteEnableCommentReview) {
      // 需要审核则params的needSendMailToParent 为true
      params.needSendMailToParent = true
    } else {
      // 不需要审核则立即发送
      sendParentMailFlag = true
    }
  }

  // save
  commentUtils.save(params).then((data) => {
    res.send({
      status: params.status
    })
    userApiLog.info(`comment:${content} create success`)
    if (params.status === 1) {
      // 异步更新文章评论数
      postUtils.updateOne({ _id: post }, { $inc: { comnum: 1 } }, true)
      cacheDataUtils.getCommentList()
    }
    utils.sendCommentAddNotice(postInfo, data)
    if (sendParentMailFlag) {
      // 发送回复邮件通知
      // 获取父评论信息
      utils.sendReplyCommentNotice(postInfo, data)
    }
  }).catch((err) => {
    console.error(err)
    res.status(400).json({
      errors: [{
        message: '评论创建失败'
      }]
    })
    userApiLog.error(`comment:${content} create fail, ${JSON.stringify(err)}`)
  })

}
