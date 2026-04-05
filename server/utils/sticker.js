const fs = require('fs')
const path = require('path')
const stickerGroupUtils = require('../mongodb/utils/stickerGroups')
const stickerUtils = require('../mongodb/utils/stickers')
const utils = require('./utils')

const MAX_STICKER_COUNT = 3
const STICKER_REFERENCE_LOCK_KEY = 'sticker-reference'

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

function removeFileIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return
  }

  fs.unlinkSync(filePath)
}

exports.executeWithStickerReferenceLock = function (fn) {
  return utils.executeInLock(STICKER_REFERENCE_LOCK_KEY, fn)
}

exports.removeStickerFiles = function (sticker, logger) {
  if (!sticker || !sticker.imageFolder) {
    return
  }

  const filePathList = []

  if (sticker.imageFileName) {
    filePathList.push(
      path.join(
        './public/upload/sticker/',
        sticker.imageFolder,
        sticker.imageFileName
      )
    )
  }

  if (sticker.thumbnailFileName) {
    filePathList.push(
      path.join(
        './public/upload/sticker/',
        sticker.imageFolder,
        sticker.thumbnailFileName
      )
    )
  }

  filePathList.forEach(filePath => {
    try {
      removeFileIfExists(filePath)
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`delete sticker file fail: ${filePath}, ${error.message}`)
      }
    }
  })
}

exports.validateStickerIds = async function (stickers, options = {}) {
  const {
    requireVisible = false,
    requireVisibleGroup = false,
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

  const existingStickers = await stickerUtils.find(
    query,
    null,
    requireVisibleGroup ? '_id group' : '_id',
    { lean: requireVisibleGroup }
  )

  if (existingStickers.length !== uniqueIds.length) {
    return {
      error: requireVisible ? '部分贴纸暂不可用' : '部分贴纸不存在'
    }
  }

  if (requireVisibleGroup) {
    const groupIdList = [
      ...new Set(existingStickers.map(item => String(item.group || '')))
    ]

    if (groupIdList.length === 0 || groupIdList.includes('')) {
      return {
        error: requireVisible ? '部分贴纸暂不可用' : '部分贴纸不存在'
      }
    }

    const visibleGroups = await stickerGroupUtils.find(
      {
        _id: { $in: groupIdList },
        status: 1
      },
      null,
      '_id',
      { lean: true }
    )

    if (visibleGroups.length !== groupIdList.length) {
      return {
        error: requireVisible ? '部分贴纸暂不可用' : '部分贴纸不存在'
      }
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
