const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { content, top, nickname, url, email, status, id, __v } = req.body
  // 如果content超过500个字符，就报错
  if (content?.length > 500) {
    res.status(400).json({
      errors: [
        {
          message: '评论内容不能超过500个字符'
        }
      ]
    })
    return
  }
  // nickname 20个字符以内
  if (nickname?.length > 20) {
    res.status(400).json({
      errors: [
        {
          message: '昵称不能超过20个字符'
        }
      ]
    })
    return
  }
  // url 200个字符以内
  if (url?.length > 200) {
    res.status(400).json({
      errors: [
        {
          message: 'url不能超过200个字符'
        }
      ]
    })
    return
  }
  if (email) {
    // email 100个字符以内
    if (email?.length > 100) {
      res.status(400).json({
        errors: [
          {
            message: '邮箱地址不能超过100个字符'
          }
        ]
      })
      return
    }
  }
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
      type: 'isURL',
      required: false,
      options: {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true,
        require_valid_protocol: true,
        require_tld: true,
        require_port: false,
        allow_protocol_relative_urls: false,
        validate_length: false
      }
    },
    {
      key: 'email',
      label: '邮箱地址',
      type: 'isEmail',
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
