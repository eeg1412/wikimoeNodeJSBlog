
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const tagUtils = require('../../../mongodb/utils/tags')
const adminApiLog = log4js.getLogger('adminApi')
const validator = require('validator')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const id = req.body.id
  let { __v } = req.body
  // 校验id是否存在
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

  const params = {
    editorVersion: 5,
    content: '',
    status: 0,
  }
  // 更新
  postUtils.updateOne({ _id: id, __v: __v }, params).then((data) => {
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
    adminApiLog.info(`post update success`)
    // 新旧status不一样，更新缓存
    cacheDataUtils.getPostArchiveList()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新文章失败'
      }]
    })
    adminApiLog.error(`post update fail, ${logErrorToText(err)}`)
  })

}
