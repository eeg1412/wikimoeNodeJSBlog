const stickerUtils = require('../../../mongodb/utils/stickers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.query
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  try {
    const data = await stickerUtils.findOne({ _id: id })
    if (!data) {
      res.status(400).json({
        errors: [{ message: '贴纸不存在' }]
      })
      return
    }
    res.send({ data: data })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '获取贴纸详情失败' }]
    })
    adminApiLog.error(`sticker detail fail, ${logErrorToText(err)}`)
  }
}
