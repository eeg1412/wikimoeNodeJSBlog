const stickerUtils = require('../../../mongodb/utils/stickers')
const commentUtils = require('../../../mongodb/utils/comments')
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

  // 校验目标贴纸是否存在且为显示状态
  const toSticker = await stickerUtils.findOne({ _id: toStickerId, status: 1 })
  if (!toSticker) {
    res.status(400).json({
      errors: [{ message: '目标贴纸不存在' }]
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

  try {
    // 先将源贴纸设置为不显示
    await stickerUtils.updateOne({ _id: fromStickerId }, { status: 0 })

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

    // 替换完成后删除源贴纸及其文件
    const fs = require('fs')
    const path = require('path')
    if (fromSticker.imageFileName && fromSticker.imageFolder) {
      try {
        fs.unlinkSync(
          path.join(
            './public/upload/sticker/',
            fromSticker.imageFolder,
            fromSticker.imageFileName
          )
        )
      } catch (e) {
        adminApiLog.error(`delete sticker image fail: ${e.message}`)
      }
    }
    if (fromSticker.thumbnailFileName && fromSticker.imageFolder) {
      try {
        fs.unlinkSync(
          path.join(
            './public/upload/sticker/',
            fromSticker.imageFolder,
            fromSticker.thumbnailFileName
          )
        )
      } catch (e) {
        adminApiLog.error(`delete sticker thumbnail fail: ${e.message}`)
      }
    }

    await stickerUtils.deleteOne({ _id: fromStickerId })

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
  } catch (err) {
    console.error(err)
    res.status(400).json({
      errors: [{ message: '贴纸替换删除失败' }]
    })
    adminApiLog.error(`sticker replace fail, ${logErrorToText(err)}`)
  }
}
