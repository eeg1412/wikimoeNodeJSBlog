const stickerUtils = require('../../../mongodb/utils/stickers')
const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { file } = req
  const description = req.body.description
  const status =
    req.body.status === undefined ? undefined : Number(req.body.status)
  const id = req.body.id
  const __v = req.body.__v === undefined ? undefined : Number(req.body.__v)
  const taxis =
    req.body.taxis === undefined ? undefined : Number(req.body.taxis)

  const checkForm = { id, __v, description, status, taxis }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      strict: true,
      strictType: 'number',
      required: true
    },
    {
      key: 'description',
      label: '描述',
      strict: true,
      strictType: 'string',
      required: true
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number',
      required: false
    },
    {
      key: 'taxis',
      label: '排序',
      strict: true,
      strictType: 'number',
      required: false
    }
  ]
  const errors = utils.checkForm(checkForm, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const oldData = await stickerUtils.findOne({ _id: id, __v })
  if (!oldData) {
    res.status(400).json({
      errors: [{ message: '该数据不存在或已被更新' }]
    })
    return
  }

  const params = {
    description: description.trim(),
    status: status
  }
  const removeFileIfExists = filePath => {
    if (!filePath || !fs.existsSync(filePath)) {
      return
    }
    fs.unlinkSync(filePath)
  }
  const cleanupFileList = filePathList => {
    filePathList.forEach(filePath => {
      try {
        removeFileIfExists(filePath)
      } catch (error) {
        adminApiLog.error(
          `sticker file cleanup fail: ${filePath}, ${error.message}`
        )
      }
    })
  }
  let preparedFileState = null

  if (taxis !== undefined && taxis !== null) {
    params.taxis = taxis
  }

  // 如果有新图片上传
  if (file) {
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
      const imageInfo = await utils.imageMetadata(fileData)
      let { width: origWidth, height: origHeight, orientation } = imageInfo

      if (orientation && [5, 6, 7, 8].includes(orientation)) {
        const temp = origWidth
        origWidth = origHeight
        origHeight = temp
      }

      const maxSize = 256
      let newWidth, newHeight
      if (origWidth >= origHeight) {
        newWidth = Math.min(origWidth, maxSize)
        newHeight = Math.round((origHeight / origWidth) * newWidth)
      } else {
        newHeight = Math.min(origHeight, maxSize)
        newWidth = Math.round((origWidth / origHeight) * newHeight)
      }

      const thumMaxSize = 50
      let thumWidth, thumHeight
      if (origWidth >= origHeight) {
        thumWidth = Math.min(origWidth, thumMaxSize)
        thumHeight = Math.round((origHeight / origWidth) * thumWidth)
      } else {
        thumHeight = Math.min(origHeight, thumMaxSize)
        thumWidth = Math.round((origWidth / origHeight) * thumHeight)
      }

      const imageFolder = oldData.imageFolder
      const basePath = './public/upload/sticker/'
      const folderPath = path.join(basePath, imageFolder)
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      const imageFileName = `${id}.webp`
      const thumbnailFileName = `thum-${id}.webp`
      const imagePath = path.join(folderPath, imageFileName)
      const thumbnailPath = path.join(folderPath, thumbnailFileName)

      const timestamp = Date.now()
      const tempKey = `${timestamp}-${process.pid}`
      const tempImagePath = path.join(folderPath, `${id}-${tempKey}.tmp.webp`)
      const tempThumbnailPath = path.join(
        folderPath,
        `thum-${id}-${tempKey}.tmp.webp`
      )
      const hasCurrentImageFile = fs.existsSync(imagePath)
      const hasCurrentThumbnailFile = fs.existsSync(thumbnailPath)
      const backupImagePath = hasCurrentImageFile
        ? path.join(folderPath, `${imageFileName}.${tempKey}.bak`)
        : ''
      const backupThumbnailPath = hasCurrentThumbnailFile
        ? path.join(folderPath, `${thumbnailFileName}.${tempKey}.bak`)
        : ''
      const legacyFilePaths = []

      if (oldData.imageFileName && oldData.imageFileName !== imageFileName) {
        legacyFilePaths.push(
          path.join(basePath, imageFolder, oldData.imageFileName)
        )
      }
      if (
        oldData.thumbnailFileName &&
        oldData.thumbnailFileName !== thumbnailFileName
      ) {
        legacyFilePaths.push(
          path.join(basePath, imageFolder, oldData.thumbnailFileName)
        )
      }

      preparedFileState = {
        legacyFilePaths,
        cleanupTemporaryFiles() {
          cleanupFileList([
            tempImagePath,
            tempThumbnailPath,
            backupImagePath,
            backupThumbnailPath
          ])
        },
        restoreFiles() {
          try {
            if (
              hasCurrentImageFile &&
              backupImagePath &&
              fs.existsSync(backupImagePath)
            ) {
              fs.copyFileSync(backupImagePath, imagePath)
            } else if (!hasCurrentImageFile) {
              removeFileIfExists(imagePath)
            }
          } catch (error) {
            adminApiLog.error(
              `sticker image restore fail: ${imagePath}, ${error.message}`
            )
          }

          try {
            if (
              hasCurrentThumbnailFile &&
              backupThumbnailPath &&
              fs.existsSync(backupThumbnailPath)
            ) {
              fs.copyFileSync(backupThumbnailPath, thumbnailPath)
            } else if (!hasCurrentThumbnailFile) {
              removeFileIfExists(thumbnailPath)
            }
          } catch (error) {
            adminApiLog.error(
              `sticker thumbnail restore fail: ${thumbnailPath}, ${error.message}`
            )
          }
        }
      }

      await utils.imageCompress(
        '.webp',
        fileData,
        false,
        newWidth,
        newHeight,
        80,
        tempImagePath
      )

      await utils.imageCompress(
        '.webp',
        fileData,
        false,
        thumWidth,
        thumHeight,
        80,
        tempThumbnailPath
      )

      if (backupImagePath) {
        fs.copyFileSync(imagePath, backupImagePath)
      }
      if (backupThumbnailPath) {
        fs.copyFileSync(thumbnailPath, backupThumbnailPath)
      }

      fs.copyFileSync(tempImagePath, imagePath)
      fs.copyFileSync(tempThumbnailPath, thumbnailPath)

      params.width = newWidth
      params.height = newHeight
      params.thumWidth = thumWidth
      params.thumHeight = thumHeight
      params.image = `/upload/sticker/${imageFolder}/${imageFileName}?v=${timestamp}`
      params.thumbnail = `/upload/sticker/${imageFolder}/${thumbnailFileName}?v=${timestamp}`
      params.imageFileName = imageFileName
      params.thumbnailFileName = thumbnailFileName
    } catch (err) {
      if (preparedFileState) {
        preparedFileState.restoreFiles()
        preparedFileState.cleanupTemporaryFiles()
        preparedFileState = null
      }
      console.error(err)
      res.status(400).json({
        errors: [{ message: '图片处理失败' }]
      })
      return
    }
  }

  try {
    const data = await stickerUtils.updateOne({ _id: id, __v }, params)

    if (data.modifiedCount === 0) {
      if (preparedFileState) {
        preparedFileState.restoreFiles()
        preparedFileState.cleanupTemporaryFiles()
      }
      res.status(400).json({
        errors: [{ message: '更新失败' }]
      })
      return
    }

    if (preparedFileState) {
      preparedFileState.cleanupTemporaryFiles()
      cleanupFileList(preparedFileState.legacyFilePaths)
    }

    res.send({ data: data })
    adminApiLog.info(`sticker update success: ${id}`)
    cacheDataUtils.getCommentList()
  } catch (err) {
    if (preparedFileState) {
      preparedFileState.restoreFiles()
      preparedFileState.cleanupTemporaryFiles()
    }
    res.status(400).json({
      errors: [{ message: '贴纸更新失败' }]
    })
    adminApiLog.error(`sticker update fail, ${logErrorToText(err)}`)
  }
}
