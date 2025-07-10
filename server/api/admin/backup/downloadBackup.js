const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
var path = require('path')

module.exports = async function (req, res, next) {
  const token = req.body.t
  // check token
  const decoded = utils.checkJWT(token)
  if (decoded.isError) {
    res.status(403).json({
      errors: [
        {
          message: '请求失败'
        }
      ]
    })
    return
  }
  const id = decoded.data.id
  const tokenType = decoded.data.tokenType
  if (tokenType !== 'downloadBackup') {
    res.status(403).json({
      errors: [
        {
          message: '请求失败'
        }
      ]
    })
    return
  }

  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
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
      // download
      const file = path.join('./backups', data.filename)
      if (fs.existsSync(file)) {
        res.download(file, data.filename, err => {
          if (err) {
            adminApiLog.error(`backup detail get fail, ${logErrorToText(err)}`)
          }
        })
      } else {
        res.status(400).json({
          errors: [
            {
              message: '备份文件不存在'
            }
          ]
        })
      }
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
