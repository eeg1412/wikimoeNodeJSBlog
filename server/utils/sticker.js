const stickerUtils = require('../mongodb/utils/stickers')
const utils = require('./utils')

const MAX_STICKER_COUNT = 3

function normalizeStickerIds(stickers) {
  if (!Array.isArray(stickers)) {
    return []
  }

  const result = []

  stickers.forEach(stickerId => {
    const normalizedId = String(stickerId || '')
    if (!normalizedId) {
      return
    }
    result.push(normalizedId)
  })

  return result
}

exports.validateStickerIds = async function (stickers, options = {}) {
  const {
    requireVisible = false,
    allowUndefined = false,
    maxCount = MAX_STICKER_COUNT
  } = options

  if (stickers === undefined) {
    if (allowUndefined) {
      return { ids: undefined }
    }
    return { ids: [] }
  }

  if (!Array.isArray(stickers)) {
    return { error: '贴纸格式错误' }
  }

  const ids = normalizeStickerIds(stickers)

  if (ids.length > maxCount) {
    return { error: `最多只能选择${maxCount}个贴纸` }
  }

  for (const stickerId of ids) {
    if (!utils.isObjectId(stickerId)) {
      return { error: '贴纸ID格式错误' }
    }
  }

  if (ids.length === 0) {
    return { ids }
  }

  const uniqueIds = [...new Set(ids)]

  const query = {
    _id: { $in: uniqueIds }
  }

  if (requireVisible) {
    query.status = 1
  }

  const existingStickers = await stickerUtils.find(query, null, '_id')

  if (existingStickers.length !== uniqueIds.length) {
    return {
      error: requireVisible ? '部分贴纸暂不可用' : '部分贴纸不存在'
    }
  }

  return { ids }
}

exports.getCommentContentValidationError = function (
  content,
  stickerIds,
  minLength = 1
) {
  const text = typeof content === 'string' ? content : ''
  const hasStickers = Array.isArray(stickerIds) && stickerIds.length > 0

  if (!text && !hasStickers) {
    return '请输入内容'
  }

  if (text && text.length > 500) {
    return '评论内容不能超过500个字符'
  }

  if (text && text.length < minLength) {
    return `评论内容不能少于${minLength}个字`
  }

  return null
}
