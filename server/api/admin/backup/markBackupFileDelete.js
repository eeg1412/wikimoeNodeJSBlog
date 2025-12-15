const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id, __v } = req.body

  const bodyCheck = {
    id,
    __v
  }
  const rule = [
    {
      key: 'id',
      label: '备份ID',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      type: 'isInt',
      strict: true,
      strictType: 'number',
      options: {
        min: 0
      },
      required: true
    }
  ]
  const errors = utils.checkForm(bodyCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  const params = {
    fileStatus: 2 // 标记为删除状态
  }
  // updateOne
  backupUtils
    .updateOne({ _id: id, __v, type: 1 }, params)
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
      adminApiLog.info(`backup update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '备份更新失败'
          }
        ]
      })
      adminApiLog.error(`backup update fail, ${logErrorToText(err)}`)
    })
}
