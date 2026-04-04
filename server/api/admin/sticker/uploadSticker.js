const stickerUtils = require('../../../mongodb/utils/stickers')
const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const { Worker } = require('worker_threads')

module.exports = async function (req, res, next) {
  const { file } = req
  const headers = req.headers
  const groupId = req.body.group || headers['x-sticker-group']
  const description = req.body.description
    ? String(req.body.description)
    : headers['x-sticker-description']
      ? decodeURIComponent(headers['x-sticker-description'])
      : ''

  if (!file) {
    res.status(400).json({
      errors: [{ message: '请选择贴纸图片' }]
    })
    return
  }

  if (!groupId || !utils.isObjectId(groupId)) {
    res.status(400).json({
      errors: [{ message: '贴纸组ID格式错误' }]
    })
    return
  }

  if (!description || description.trim().length === 0) {
    res.status(400).json({
      errors: [{ message: '请填写贴纸描述' }]
    })
    return
  }

  // 校验贴纸组是否存在
  const groupData = await stickerGroupUtils.findOne({ _id: groupId })
  if (!groupData) {
    res.status(400).json({
      errors: [{ message: '贴纸组不存在' }]
    })
    return
  }

  // 验证文件类型为图片
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ]
  if (!allowedMimeTypes.includes(file.mimetype)) {
    res.status(400).json({
      errors: [{ message: '不支持的图片格式' }]
    })
    return
  }

  try {
    const fileData = file.buffer

    // 获取图片元数据
    const imageInfo = await utils.imageMetadata(fileData)
    let { width: origWidth, height: origHeight, orientation } = imageInfo

    // 处理旋转
    if (orientation && [5, 6, 7, 8].includes(orientation)) {
      const temp = origWidth
      origWidth = origHeight
      origHeight = temp
    }

    // 计算图片尺寸（最大边256px）
    const maxSize = 256
    let newWidth, newHeight
    if (origWidth >= origHeight) {
      newWidth = Math.min(origWidth, maxSize)
      newHeight = Math.round((origHeight / origWidth) * newWidth)
    } else {
      newHeight = Math.min(origHeight, maxSize)
      newWidth = Math.round((origWidth / origHeight) * newHeight)
    }

    // 计算缩略图尺寸（最长边50px）
    const thumMaxSize = 50
    let thumWidth, thumHeight
    if (origWidth >= origHeight) {
      thumWidth = Math.min(origWidth, thumMaxSize)
      thumHeight = Math.round((origHeight / origWidth) * thumWidth)
    } else {
      thumHeight = Math.min(origHeight, thumMaxSize)
      thumWidth = Math.round((origWidth / origHeight) * thumHeight)
    }

    // 根据当前年份生成16进制文件夹
    const now = new Date()
    const yearHex = now.getFullYear().toString(16)
    const stickerId = new mongoose.Types.ObjectId()
    const basePath = './public/upload/sticker/'
    const folderPath = path.join(basePath, yearHex)

    // 确保目录存在
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }

    const imageFileName = `${stickerId}.webp`
    const thumbnailFileName = `thum-${stickerId}.webp`
    const imagePath = path.join(folderPath, imageFileName)
    const thumbnailPath = path.join(folderPath, thumbnailFileName)

    // 生成图片（80质量webp，最大边256px）
    await utils.imageCompress(
      '.webp',
      fileData,
      false,
      newWidth,
      newHeight,
      80,
      imagePath
    )

    // 生成缩略图（最长边50px）
    await utils.imageCompress(
      '.webp',
      fileData,
      false,
      thumWidth,
      thumHeight,
      80,
      thumbnailPath
    )

    const timestamp = Date.now()
    const imageUrl = `/upload/sticker/${yearHex}/${imageFileName}?v=${timestamp}`
    const thumbnailUrl = `/upload/sticker/${yearHex}/${thumbnailFileName}?v=${timestamp}`

    // 保存到数据库
    const stickerData = {
      _id: stickerId,
      group: groupId,
      description: description.trim(),
      taxis: 0,
      width: newWidth,
      height: newHeight,
      thumWidth: thumWidth,
      thumHeight: thumHeight,
      status: 0,
      image: imageUrl,
      thumbnail: thumbnailUrl,
      imageFolder: yearHex,
      imageFileName: imageFileName,
      thumbnailFileName: thumbnailFileName
    }

    const savedSticker = await stickerUtils.save(stickerData)
    res.send({
      data: savedSticker
    })
    adminApiLog.info(`sticker upload success: ${stickerId}`)
  } catch (err) {
    console.error(err)
    res.status(400).json({
      errors: [{ message: '贴纸上传失败' }]
    })
    adminApiLog.error(`sticker upload fail, ${logErrorToText(err)}`)
  }
}
