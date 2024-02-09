const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { status, id, __v } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // status只能是0 1 2
  const statusList = [0, 1, 2]
  if (!statusList.includes(status)) {
    res.status(400).json({
      errors: [{
        message: 'status状态不正确'
      }]
    })
    return
  }

  const params = {
    status
  }

  // 评论状态,0待审核,1已审核,2未通过

  // 获取评论信息
  const commentInfo = await commentUtils.findOne({ _id: id, __v })
  if (!commentInfo) {
    res.status(400).json({
      errors: [{
        message: '评论不存在'
      }]
    })
    return
  }



  // updateOne
  commentUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
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
        postUtils.updateOne({ _id: commentInfo.post }, { $inc: { comnum: 1 } })
        // 发送邮件通知
        // 包含parent时,needSendMailToParent为true
        if (commentInfo.parent && commentInfo.needSendMailToParent) {
          // 发送回复邮件通知
          // 发送邮件通知
          utils.sendReplyCommentNotice(null, commentInfo, null)
          // 更新needSendMailToParent为false
          commentUtils.updateOne({ _id: commentInfo._id }, { needSendMailToParent: false })
        }
      }
      // 如果是审核未通过或者待评论，那么就更新文章评论数-1
      if ((newStatus === 2 || newStatus === 0) && oldStatus === 1) {
        postUtils.updateOne({ _id: commentInfo.post }, { $inc: { comnum: -1 } })
      }
    }

    cacheDataUtils.getCommentList()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '评论更新失败'
      }]
    })
    adminApiLog.error(`comment:${id} update fail, ${logErrorToText(err)}`)
  })
}
