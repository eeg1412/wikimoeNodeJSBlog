const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { ids, albumId } = req.body
  // ids 必须为数组
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      errors: [{
        message: '缺少ids'
      }]
    })
    return
  }
  const rule = [
    {
      key: 'album',
      label: '媒体名称',
      type: 'isMongoId',
      required: true,
    },
  ]
  const params = {
    album: albumId,
  }
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateMany
  attachmentUtils.updateMany({ _id: { $in: ids } }, params).then((data) => {
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
    adminApiLog.info(`attachment album update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新失败'
      }]
    })
    adminApiLog.error(`attachment album update fail, ${JSON.stringify(err)}`)
  })


}
