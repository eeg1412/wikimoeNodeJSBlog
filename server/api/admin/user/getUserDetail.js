const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({ errors: [{ message: 'id格式错误' }] })
    return
  }
  // findOne
  userUtils
    .findOne({ _id: id }, '-password')
    .then(data => {
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '管理员不存在'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '管理员详情获取失败'
          }
        ]
      })
      adminApiLog.error(`admin detail get fail, ${logErrorToText(err)}`)
    })
}
