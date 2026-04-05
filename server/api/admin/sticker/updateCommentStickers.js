const stickerUtils = require('../../../mongodb/utils/stickers')
const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const stickerHelper = require('../../../utils/sticker')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { id, stickers, __v } = req.body
  const shouldUseStickerReferenceLock =
    Array.isArray(stickers) && stickers.length > 0

  const updateCommentStickers = async () => {
    if (!utils.isObjectId(id)) {
      res.status(400).json({
        errors: [{ message: '评论ID格式错误' }]
      })
      return
    }

    if (!Number.isInteger(__v)) {
      res.status(400).json({
        errors: [{ message: '__v格式错误' }]
      })
      return
    }

    const stickerValidation = await stickerHelper.validateStickerIds(stickers)
    if (stickerValidation.error) {
      res.status(400).json({
        errors: [{ message: stickerValidation.error }]
      })
      return
    }

    // 获取评论
    const commentInfo = await commentUtils.findOne({ _id: id, __v })
    if (!commentInfo) {
      res.status(400).json({
        errors: [{ message: '评论不存在或已被更新' }]
      })
      return
    }

    const { siteMinCommentLength = 1 } = global.$globalConfig.commentSettings
    const contentValidationError =
      stickerHelper.getCommentContentValidationError(
        commentInfo.content || '',
        stickerValidation.ids,
        siteMinCommentLength
      )
    if (contentValidationError) {
      res.status(400).json({
        errors: [{ message: contentValidationError }]
      })
      return
    }

    commentUtils
      .updateOne({ _id: id, __v }, { stickers: stickerValidation.ids })
      .then(data => {
        if (data.modifiedCount === 0) {
          res.status(400).json({
            errors: [{ message: '更新失败' }]
          })
          return
        }
        res.send({ data: data })
        adminApiLog.info(`comment stickers update success: ${id}`)
        cacheDataUtils.getCommentList()
      })
      .catch(err => {
        res.status(400).json({
          errors: [{ message: '评论贴纸更新失败' }]
        })
        adminApiLog.error(
          `comment stickers update fail, ${logErrorToText(err)}`
        )
      })
  }

  if (shouldUseStickerReferenceLock) {
    await stickerHelper.executeWithStickerReferenceLock(updateCommentStickers)
    return
  }

  await updateCommentStickers()
}
