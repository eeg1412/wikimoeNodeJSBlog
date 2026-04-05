const stickerUtils = require('../../../mongodb/utils/stickers')
const commentUtils = require('../../../mongodb/utils/comments')
const stickerHelper = require('../../../utils/sticker')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { fromStickerId, toStickerId } = req.body

  if (!utils.isObjectId(fromStickerId)) {
    res.status(400).json({
      errors: [{ message: '源贴纸ID格式错误' }]
    })
    return
  }
  if (!utils.isObjectId(toStickerId)) {
    res.status(400).json({
      errors: [{ message: '目标贴纸ID格式错误' }]
    })
    return
  }

  if (fromStickerId === toStickerId) {
    res.status(400).json({
      errors: [{ message: '源贴纸和目标贴纸不能相同' }]
    })
    return
  }

  try {
    await stickerHelper.executeWithStickerReferenceLock(async () => {
      const targetValidation = await stickerHelper.validateStickerIds(
        [toStickerId],
        {
          requireVisible: true,
          requireVisibleGroup: true,
          maxCount: 1
        }
      )
      if (targetValidation.error) {
        res.status(400).json({
          errors: [{ message: '目标贴纸不可用' }]
        })
        return
      }

      const fromSticker = await stickerUtils.findOne({ _id: fromStickerId })
      if (!fromSticker) {
        res.status(400).json({
          errors: [{ message: '源贴纸不存在' }]
        })
        return
      }

      // 查找所有引用了源贴纸的评论
      const comments = await commentUtils.find(
        { stickers: fromStickerId },
        null,
        '_id stickers'
      )

      let replaceCount = 0
      for (const comment of comments) {
        const newStickers = comment.stickers.map(s =>
          s.toString() === fromStickerId ? toStickerId : s.toString()
        )
        await commentUtils.updateOne(
          { _id: comment._id },
          { stickers: newStickers }
        )
        replaceCount++
      }

      const deleteResult = await stickerUtils.deleteOne({ _id: fromStickerId })
      if (deleteResult.deletedCount === 0) {
        res.status(400).json({
          errors: [{ message: '贴纸删除失败' }]
        })
        return
      }

      stickerHelper.removeStickerFiles(fromSticker, adminApiLog)

      res.send({
        data: {
          message: `替换完成，共替换 ${replaceCount} 条评论`,
          replaceCount: replaceCount
        }
      })
      cacheDataUtils.getCommentList()
      adminApiLog.info(
        `sticker replace success: ${fromStickerId} -> ${toStickerId}, replaced ${replaceCount} comments`
      )
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({
      errors: [{ message: '贴纸替换删除失败' }]
    })
    adminApiLog.error(`sticker replace fail, ${logErrorToText(err)}`)
  }
}
