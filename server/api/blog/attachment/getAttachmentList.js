const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { album } = req.query
  const params = {}
  if (album && utils.isObjectId(album)) {
    params.album = album
  } else {
    // 报错
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }

  // updatedAt越新越靠前，_id越新越靠前
  const sort = {
    updatedAt: -1,
    _id: -1
  }
  attachmentUtils
    .find(
      params,
      sort,
      'album description filepath filename height mimetype name status thumHeight thumWidth thumfor width _id'
    )
    .then(data => {
      // 返回格式list,total
      res.send({
        data: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '媒体列表获取失败'
          }
        ]
      })
      userApiLog.error(`attachment list get fail, ${logErrorToText(err)}`)
    })
}
