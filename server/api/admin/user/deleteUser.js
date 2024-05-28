const userUtils = require('../../../mongodb/utils/users')
const postUtils = require('../../../mongodb/utils/posts')
const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  // 数据给与的ID
  const toUserId = req.query.toUserId
  // 转让类型，0删除，1转让
  const changeType = req.query.changeType
  // changeType 必须为0或1
  if (!['0', '1'].includes(changeType)) {
    res.status(400).json({
      errors: [{
        message: 'changeType不正确'
      }]
    })
    return
  }
  if (changeType === '1') {
    // 判断id是否符合mongodb的id规则
    if (!utils.isObjectId((toUserId || ''))) {
      res.status(400).json({
        errors: [{
          message: 'toUserId不正确'
        }]
      })
      return
    }
    // 查询用户
    const userRes = await userUtils.findOne({ _id: toUserId })
    if (!userRes) {
      res.status(400).json({
        errors: [{
          message: '转让管理员不存在'
        }]
      })
      return
    }
  }
  if (!id || !utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{
        message: 'id不正确'
      }]
    })
    return
  }
  // 管理员不能删除自己
  const adminId = req.admin.id
  if (id === adminId) {
    res.status(400).json({
      errors: [{
        message: '不能删除自己'
      }]
    })
    return
  }
  //  删除管理员
  userUtils.deleteOne({ _id: id }).then((data) => {
    if (data.deletedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '删除失败'
        }]
      })
      return
    }
    const promiseArr = []
    if (changeType === '1') {
      // 转让文章
      promiseArr.push(postUtils.updateMany({ author: id }, { author: toUserId }))
      // 转让评论
      promiseArr.push(commentUtils.updateMany({ user: id }, { user: toUserId }))
    } else if (changeType === '0') {
      // 删除文章
      promiseArr.push(postUtils.deleteMany({ author: id }))
      // 删除评论
      promiseArr.push(commentUtils.deleteMany({ user: id }))
    }
    // 执行promise
    Promise.all(promiseArr).then(() => {
      res.send({
        data: {
          message: '删除成功'
        }
      })
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '管理员删除成功，文章或评论处理失败'
        }]
      })
      adminApiLog.error(`admin delete success but post or comment fail, ${logErrorToText(err)}`)
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '删除失败'
      }]
    })
    adminApiLog.error(`admin delete fail, ${logErrorToText(err)}`)
  })
}