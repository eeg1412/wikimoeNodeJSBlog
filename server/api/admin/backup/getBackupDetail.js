const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }
  // findOne
  backupUtils
    .findOne({ _id: id })
    .then(data => {
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '备份不存在'
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
            message: '备份详情获取失败'
          }
        ]
      })
      adminApiLog.error(`backup detail get fail, ${logErrorToText(err)}`)
    })
}
