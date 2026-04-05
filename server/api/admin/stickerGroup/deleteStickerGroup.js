const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
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
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }

  try {
    await stickerHelper.executeWithStickerReferenceLock(async () => {
      const oldData = await stickerGroupUtils.findOne({ _id: id })
      if (!oldData) {
        res.status(400).json({
          errors: [
            {
              message: '该数据不存在'
            }
          ]
        })
        return
      }

      // 检查组内是否有贴纸被评论引用
      const stickers = await stickerUtils.find(
        { group: id },
        null,
        '_id imageFolder imageFileName thumbnailFileName',
        {
          lean: true
        }
      )
      if (stickers.length > 0) {
        const stickerIds = stickers.map(s => s._id)
        const referencedCount = await commentUtils.count({
          stickers: { $in: stickerIds }
        })
        if (referencedCount > 0) {
          res.status(400).json({
            errors: [
              {
                message:
                  '该贴纸组内有贴纸正在被评论引用，无法删除。请先处理相关贴纸后再试。'
              }
            ]
          })
          return
        }

        await stickerUtils.deleteMany({ group: id })

        stickers.forEach(sticker => {
          stickerHelper.removeStickerFiles(sticker, adminApiLog)
        })
      }

      const data = await stickerGroupUtils.deleteOne({ _id: id })
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败'
            }
          ]
        })
        return
      }
      res.send({
        data: {
          message: '删除成功'
        }
      })
      adminApiLog.info(`stickerGroup delete success`)
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '贴纸组删除失败'
        }
      ]
    })
    adminApiLog.error(`stickerGroup delete fail, ${logErrorToText(err)}`)
  }
}
