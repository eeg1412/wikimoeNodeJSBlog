const stickerUtils = require('../../../mongodb/utils/stickers')
const commentUtils = require('../../../mongodb/utils/comments')
const stickerHelper = require('../../../utils/sticker')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  try {
    await stickerHelper.executeWithStickerReferenceLock(async () => {
      const oldData = await stickerUtils.findOne({ _id: id })
      if (!oldData) {
        res.status(400).json({
          errors: [{ message: '该数据不存在' }]
        })
        return
      }

      // 检查是否有评论引用了这张贴纸
      const referencedCount = await commentUtils.count({
        stickers: id
      })

      if (referencedCount > 0) {
        // 有评论引用，返回提示信息，前端需要引导用户进行全局替换
        res.status(400).json({
          errors: [
            {
              message: '该贴纸被评论引用中，请先进行全局替换后再删除',
              code: 'STICKER_IN_USE',
              referencedCount: referencedCount
            }
          ]
        })
        return
      }

      const deleteResult = await stickerUtils.deleteOne({ _id: id })
      if (deleteResult.deletedCount === 0) {
        res.status(400).json({
          errors: [{ message: '删除失败' }]
        })
        return
      }

      stickerHelper.removeStickerFiles(oldData, adminApiLog)

      res.send({
        data: { message: '删除成功' }
      })
      adminApiLog.info(`sticker delete success: ${id}`)
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '贴纸删除失败' }]
    })
    adminApiLog.error(`sticker delete fail, ${logErrorToText(err)}`)
  }
}
