const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { content, top, nickname, url, email, status, id, __v } = req.body
  const checkForm = {
    id,
    __v,
    content,
    top,
    nickname,
    url,
    email,
    status
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      strict: true,
      strictType: 'number',
      required: true
    },
    {
      key: 'content',
      label: '内容',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'top',
      label: '置顶',
      strict: true,
      strictType: 'boolean',
      required: false
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number',
      required: false
    },
    {
      key: 'nickname',
      label: '昵称',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'url',
      label: '网址',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'email',
      label: '邮箱',
      strict: true,
      strictType: 'string',
      required: false
    }
  ]
  const errors = utils.checkForm(checkForm, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const params = {}

  if (content) {
    params.content = content
  }
  // 如果top是boolean类型，那么就更新，否则不更新
  if (typeof top === 'boolean') {
    params.top = top
  }
  // 评论状态,0待审核,1已审核,2未通过
  // 如果status是0-2的整数 ，那么就更新，否则不更新
  // 转换成整数
  if (status !== undefined && status !== null) {
    const statusInt = parseInt(status)
    if (statusInt >= 0 && statusInt <= 2) {
      params.status = statusInt
    }
  }
  // 如果nickname，url，email是字符串，那么就更新，否则不更新
  if (typeof nickname === 'string') {
    params.nickname = nickname
  }
  if (typeof url === 'string') {
    params.url = url
  }
  if (typeof email === 'string') {
    if (email) {
      // 正则校验email
      const emailReg =
        /^[a-z0-9_+-]+(\.[a-z0-9_+-]+)*@([a-z0-9][a-z0-9-]*[a-z0-9]*\.)+[a-z]{2,}$/

      if (!emailReg.test(email)) {
        res.status(400).json({
          errors: [
            {
              message: '邮箱格式不正确'
            }
          ]
        })
        return
      }
    }
    params.email = email
  }

  // 获取评论信息
  const commentInfo = await commentUtils.findOne({ _id: id, __v })
  if (!commentInfo) {
    res.status(400).json({
      errors: [
        {
          message: '评论不存在'
        }
      ]
    })
    return
  }

  // updateOne
  commentUtils
    .updateOne({ _id: id, __v }, params)
    .then(data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
      adminApiLog.info(`comment:${id} update success`)
      // 判断是否更新了评论状态
      const oldStatus = commentInfo.status
      const newStatus = params.status
      // 评论状态,0待审核,1审核通过,2未通过
      // 如果更新了评论状态，那么就更新文章评论数
      if (oldStatus !== newStatus) {
        // 如果是审核通过，那么就更新文章评论数+1
        if (newStatus === 1) {
          postUtils.updateOne(
            { _id: commentInfo.post },
            { $inc: { comnum: 1 } }
          )
          // 发送邮件通知
          // 包含parent时,needSendMailToParent为true
          if (commentInfo.parent && commentInfo.needSendMailToParent) {
            // 发送回复邮件通知
            // 发送邮件通知
            utils.sendReplyCommentNotice(null, commentInfo, null)
            // 更新needSendMailToParent为false
            commentUtils.updateOne(
              { _id: commentInfo._id },
              { needSendMailToParent: false }
            )
          }
        }
        // 如果是审核未通过或者待评论，那么就更新文章评论数-1
        if ((newStatus === 2 || newStatus === 0) && oldStatus === 1) {
          postUtils.updateOne(
            { _id: commentInfo.post },
            { $inc: { comnum: -1 } }
          )
        }
      }

      cacheDataUtils.getCommentList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '评论更新失败'
          }
        ]
      })
      adminApiLog.error(`comment:${id} update fail, ${logErrorToText(err)}`)
    })
}
