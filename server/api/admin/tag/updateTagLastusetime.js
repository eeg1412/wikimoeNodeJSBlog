const tagUtils = require('../../../mongodb/utils/tags')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // updateTagLastusetime
  const id = req.body.id
  const lastusetime = new Date()
  const params = {
    lastusetime: lastusetime,
  }
  // updateOne
  tagUtils.updateOne({ _id: id }, params).then((data) => {
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
    adminApiLog.info(`tag update usetime success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '标签更新失败'
      }]
    })
    adminApiLog.error(`tag update usetime fail, ${logErrorToText(err)}`)
  })
}
