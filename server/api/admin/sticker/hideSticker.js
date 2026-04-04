const stickerUtils = require('../../../mongodb/utils/stickers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.body

  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: '贴纸ID格式错误' }]
    })
    return
  }

  try {
    await stickerUtils.updateOne({ _id: id }, { status: 0 })
    res.send({
      data: { message: '已将贴纸设置为不显示' }
    })
    adminApiLog.info(`sticker hide success: ${id}`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '操作失败' }]
    })
    adminApiLog.error(`sticker hide fail, ${logErrorToText(err)}`)
  }
}
