const chalk = require('chalk')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // findOne
  postUtils.findOne({ _id: id }).then((data) => {
    if (!data) {
      res.status(404).json({
        errors: [{
          message: '文章不存在'
        }]
      })
      return
    }
    res.send({
      data: data
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '文章详情获取失败'
      }]
    })
    adminApiLog.error(`post detail get fail, ${JSON.stringify(err)}`)
  })
}
