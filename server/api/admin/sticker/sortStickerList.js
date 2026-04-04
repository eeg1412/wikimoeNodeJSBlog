const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const stickerUtils = require('../../../mongodb/utils/stickers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { groupId, stickerIds } = req.body

  if (!utils.isObjectId(groupId)) {
    res.status(400).json({
      errors: [{ message: '贴纸组ID格式错误' }]
    })
    return
  }

  if (!Array.isArray(stickerIds) || stickerIds.length === 0) {
    res.status(400).json({
      errors: [{ message: '贴纸排序数据不能为空' }]
    })
    return
  }

  const normalizedIds = stickerIds.map(id => String(id || '')).filter(Boolean)
  const uniqueIds = [...new Set(normalizedIds)]

  if (normalizedIds.length !== uniqueIds.length) {
    res.status(400).json({
      errors: [{ message: '贴纸排序数据格式错误' }]
    })
    return
  }

  for (const stickerId of normalizedIds) {
    if (!utils.isObjectId(stickerId)) {
      res.status(400).json({
        errors: [{ message: '贴纸ID格式错误' }]
      })
      return
    }
  }

  try {
    const groupInfo = await stickerGroupUtils.findOne({ _id: groupId }, '_id')
    if (!groupInfo) {
      res.status(400).json({
        errors: [{ message: '贴纸组不存在' }]
      })
      return
    }

    const stickers = await stickerUtils.find(
      { group: groupId },
      { taxis: 1, createdAt: 1 },
      '_id',
      { lean: true }
    )

    if (stickers.length !== normalizedIds.length) {
      res.status(400).json({
        errors: [{ message: '贴纸数量不匹配，请刷新后重试' }]
      })
      return
    }

    const currentIdSet = new Set(stickers.map(item => String(item._id)))
    const hasInvalidSticker = uniqueIds.some(id => !currentIdSet.has(id))
    if (hasInvalidSticker) {
      res.status(400).json({
        errors: [{ message: '排序中包含不属于当前贴纸组的贴纸' }]
      })
      return
    }

    await Promise.all(
      normalizedIds.map((id, index) => {
        return stickerUtils.updateOne(
          { _id: id, group: groupId },
          { taxis: index + 1 }
        )
      })
    )

    res.send({ data: true })
    adminApiLog.info(`sticker sort success: group=${groupId}`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '贴纸排序失败' }]
    })
    adminApiLog.error(`sticker sort fail, ${logErrorToText(err)}`)
  }
}
