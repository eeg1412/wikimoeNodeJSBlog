const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {

  const { post, parent, content, top } = req.body
  const user = req.admin.id
  const ip = utils.getUserIp(req)
  // 校验格式
  const params = {
    post,
    parent,
    content,
    user,
    top,
    // 因为是后台接口，所以默认通过审核
    status: 1,
    ip: ip,
    deviceInfo: utils.deviceUAInfoUtils(req),
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false)
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
      key: 'user',
      label: '评论用户',
      type: null,
      required: true,
    }
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

  // save
  commentUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`comment:${content} create success`)
    cacheDataUtils.getCommentList()
    // 异步更新文章评论数
    postUtils.updateOne({ _id: post }, { $inc: { comnum: 1 } })
    // 发送邮件通知
    if (parent) {
      utils.sendReplyCommentNotice(postInfo, String(data._id))
    }
    utils.reflushBlogCache()
  }).catch((err) => {
    console.error(err)
    res.status(400).json({
      errors: [{
        message: '评论创建失败'
      }]
    })
    adminApiLog.error(`comment:${content} create fail, ${logErrorToText(err)}`)
  })

}
