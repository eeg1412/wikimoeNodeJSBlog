const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const utils = require('../../../utils/utils')
const albumUtils = require('../../../mongodb/utils/albums')
const attachmentsUtils = require('../../../mongodb/utils/attachments')

// 解析HDR单独设置选项，仅接受 keep / notKeep，其余一律归一为 default（按照后台设置）
function normalizeHDROption(value) {
  if (value === 'keep') {
    return 'keep'
  }
  if (value === 'notKeep') {
    return 'notKeep'
  }
  return 'default'
}

module.exports = async function (req, res, next) {
  let { file } = req
  const headers = req.headers
  const albumid = headers['albumid']
  const noCompress = headers['x-no-compress'] === '1' ? true : false
  const noThumbnail = headers['x-no-thumbnail'] === '1' ? true : false
  const is360Panorama = headers['x-is-360-panorama'] === '1' ? true : false
  // HDR单独设置：保留HDR、缩略图保留HDR（default/keep/notKeep），以及手动标记为HDR
  const keepHDROption = normalizeHDROption(headers['x-keep-hdr'])
  const thumbnailKeepHDROption = normalizeHDROption(
    headers['x-thumbnail-keep-hdr']
  )
  const markAsHDR = headers['x-mark-as-hdr'] === '1'

  let imgSettingCompressMaxSizeHeader = headers['x-compress-max-size']
  // 判断 imgSettingCompressMaxSizeHeader 是否是正整数
  if (
    imgSettingCompressMaxSizeHeader &&
    !/^[1-9]\d*$/.test(imgSettingCompressMaxSizeHeader)
  ) {
    // 如果不是正整数，就设置为默认值null
    imgSettingCompressMaxSizeHeader = null
  } else {
    imgSettingCompressMaxSizeHeader = parseInt(imgSettingCompressMaxSizeHeader)
  }

  // imgSettingCompressMaxSizeHeader 最小 为 1
  if (
    imgSettingCompressMaxSizeHeader !== null &&
    imgSettingCompressMaxSizeHeader < 1
  ) {
    imgSettingCompressMaxSizeHeader = null
  }
  if (!global.$globalConfig) {
    // 报错500
    res.status(500).json({
      errors: [
        {
          message: '配置项未初始化'
        }
      ]
    })
    return
  }
  // 读取全局配置
  const config = JSON.parse(JSON.stringify(global.$globalConfig.imgSettings))
  if (imgSettingCompressMaxSizeHeader) {
    config.imgSettingCompressMaxSize = imgSettingCompressMaxSizeHeader
  }
  // // 开启图片压缩
  // imgSettingEnableImgCompress: false,
  // // 图片压缩为webp格式
  // imgSettingEnableImgCompressWebp: false,
  // // 图片压缩质量
  // imgSettingCompressQuality: 80,
  // // 图片压缩最长边
  // imgSettingCompressMaxSize: 1920,
  // // 开启图片缩略图
  // imgSettingEnableImgThumbnail: false,
  // // 图片缩略图质量
  // imgSettingThumbnailQuality: 40,
  // // 图片缩略图最长边
  // imgSettingThumbnailMaxSize: 680,

  /*
   file 的内容如下:
   {
     fieldname: "file",
     originalname: "fiename.jpg",
     encoding: "7bit",
     mimetype: "image/jpeg",
     destination: "uploadCache",
     filename: "3136fce19de1ccab50741c82acc62c4c",
     path: "uploadCache\\3136fce19de1ccab50741c82acc62c4c",
     size: 947083,
     buffer: Buffer(947083) {}
   }
   */

  //  查询相册是否存在
  if (!albumid) {
    res.status(400).json({
      errors: [
        {
          message: '请指定相册'
        }
      ]
    })
    return
  }
  if (!utils.isObjectId(albumid)) {
    res.status(400).json({
      errors: [
        {
          message: '相册id格式错误'
        }
      ]
    })
    return
  }
  const album = await albumUtils.findOne({ _id: albumid })
  if (!album) {
    res.status(400).json({
      errors: [
        {
          message: '相册不存在'
        }
      ]
    })
    return
  }

  const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
  // name去掉后缀名
  const name = originalname.replace(/\.[^/.]+$/, '')
  // 数据库添加信息
  const attachment = {
    name: name,
    filename: originalname,
    filesize: file.size,
    filepath: '',
    width: 0,
    height: 0,
    mimetype: file.mimetype,
    thumfor: '',
    thumWidth: 0,
    thumHeight: 0,
    album: albumid,
    is360Panorama: is360Panorama
  }
  // 保存到数据库
  const attachmentData = await attachmentsUtils.save(attachment)
  const attachmentId = attachmentData._id.toString()

  //  赋值buffer
  let fileData = file.buffer

  let filePath = ''
  // HDR临时JPG文件路径（libavif-with-gainmap需要文件路径）
  let tempJpgPath = ''
  // 获取后缀名
  let extname = path.extname(file.originalname)
  const updateAttachment = {
    filepath: '',
    filesize: file.size,
    width: 0,
    height: 0,
    thumfor: '',
    isHDR: false,
    status: 1
  }

  try {
    if (!file.mimetype.startsWith('image')) {
      // 如果文件不是图片
      throw new Error('文件不是图片')
    }

    // 获取当前的年月，并拼接成202301这种格式
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    // 如果月份小于10，就在前面加个0
    if (month < 10) {
      month = '0' + month
    }

    // 拼接成202301这种格式
    const yearMonth = String(year) + String(month)
    // 如果不存在，就创建目录
    const yearMonthPath = path.join('./public/content/uploadfile/', yearMonth)
    if (!fs.existsSync(yearMonthPath)) {
      fs.mkdirSync(yearMonthPath, { recursive: true })
    }

    let imageInfo = await utils.imageMetadata(fileData)
    // 读取图片信息
    let { width, height, orientation } = imageInfo
    // 如果有旋转信息，需要宽高互换
    if (orientation && [5, 6, 7, 8].includes(orientation)) {
      const temp = width
      width = height
      height = temp
    }

    updateAttachment.width = width
    updateAttachment.height = height
    const animated = imageInfo.pages > 1
    // 配置
    const {
      imgSettingCompressQuality,
      imgSettingCompressMaxSize,
      imgSettingEnableImgCompressWebp,
      imgSettingThumbnailQuality,
      imgSettingEnableImgCompress,
      imgSettingEnableImgThumbnail,
      imgSettingKeepHDR,
      imgSettingThumbnailKeepHDR,
      imgSettingHDRQuality,
      imgSettingHDRGainMapQuality,
      imgSettingThumbnailHDRQuality,
      imgSettingThumbnailHDRGainMapQuality,
      imgSettingHDRAvifSpeed
    } = config

    // 判断是否需要进行HDR转换：
    // keepHDROption='keep' 显式保留，忽略是否开启图片压缩；'notKeep' 强制不保留；'default' 按后台设置
    let isHDR = false
    const isJpegImage =
      file.mimetype === 'image/jpeg' || /\.jpe?g$/i.test(extname)
    let shouldDetectHDR = false
    if (keepHDROption === 'keep') {
      shouldDetectHDR = isJpegImage
    } else if (keepHDROption === 'notKeep') {
      shouldDetectHDR = false
    } else {
      shouldDetectHDR =
        imgSettingKeepHDR &&
        imgSettingEnableImgCompress &&
        !noCompress &&
        isJpegImage
    }
    if (shouldDetectHDR) {
      // memoryStorage下没有磁盘文件，需先写入临时文件供probe/convert使用
      const hdrTempDir = path.join('./cache/hdrtemp')
      if (!fs.existsSync(hdrTempDir)) {
        fs.mkdirSync(hdrTempDir, { recursive: true })
      }
      tempJpgPath = path.join(hdrTempDir, `hdr-src-${attachmentId}.jpg`)
      fs.writeFileSync(tempJpgPath, fileData)
      try {
        const probeResult = await utils.probeJpegGainMap(tempJpgPath)
        isHDR = Boolean(probeResult && probeResult.hasGainMap)
      } catch (probeErr) {
        console.error(`probeJpegGainMap失败: ${probeErr.message}`)
        isHDR = false
      }
    }

    // 解析缩略图是否保留HDR：keep 强制保留（忽略后台缩略图开关），notKeep 强制不保留，default 按后台设置
    let thumbnailKeepHDR = false
    if (thumbnailKeepHDROption === 'keep') {
      thumbnailKeepHDR = true
    } else if (thumbnailKeepHDROption === 'notKeep') {
      thumbnailKeepHDR = false
    } else {
      thumbnailKeepHDR = imgSettingThumbnailKeepHDR
    }
    // HDR缩略图是否启用：显式保留时忽略后台「开启图片缩略图」开关
    let thumbnailEnabledForHDR = imgSettingEnableImgThumbnail
    if (thumbnailKeepHDROption === 'keep') {
      thumbnailEnabledForHDR = true
    }

    // ===== 缩略图处理 =====
    if (isHDR) {
      if (thumbnailKeepHDR) {
        // 缩略图保留HDR：使用libavif-with-gainmap生成缩小的HDR AVIF缩略图
        if (thumbnailEnabledForHDR && !noThumbnail) {
          const { imgSettingThumbnailMaxSize } = config
          const max = Math.max(width, height)
          if (
            max > imgSettingThumbnailMaxSize &&
            imgSettingThumbnailMaxSize < imgSettingCompressMaxSize
          ) {
            const scale = imgSettingThumbnailMaxSize / max
            const newWidth = Math.round(width * scale)
            const newHeight = Math.round(height * scale)

            updateAttachment.thumWidth = newWidth
            updateAttachment.thumHeight = newHeight

            const thumbnailPath = path.join(
              yearMonthPath,
              'thum-' + attachmentId + '.avif'
            )
            await utils.convertJpegGainMap(tempJpgPath, thumbnailPath, {
              quality: imgSettingThumbnailHDRQuality,
              gainMapQuality: imgSettingThumbnailHDRGainMapQuality,
              width: newWidth,
              height: newHeight,
              jobs: 'all',
              speed: imgSettingHDRAvifSpeed
            })
            updateAttachment.thumfor = thumbnailPath
          }
        }
      } else {
        // 缩略图保留HDR关闭：强制生成SDR webp缩略图（除非额外设置不生成缩略图）
        // 即使图像尺寸不满足缩略图要求，也生成一张当前分辨率的无HDR缩略图
        if (!noThumbnail) {
          const { imgSettingThumbnailMaxSize } = config
          const max = Math.max(width, height)
          let thumbWidth = width
          let thumbHeight = height
          let resizeWidth = null
          let resizeHeight = null
          if (max > imgSettingThumbnailMaxSize) {
            const scale = imgSettingThumbnailMaxSize / max
            thumbWidth = Math.round(width * scale)
            thumbHeight = Math.round(height * scale)
            resizeWidth = thumbWidth
            resizeHeight = thumbHeight
          }

          updateAttachment.thumWidth = thumbWidth
          updateAttachment.thumHeight = thumbHeight

          const thumbnailPath = path.join(
            yearMonthPath,
            'thum-' + attachmentId + '.webp'
          )
          await utils.imageCompress(
            '.webp',
            fileData,
            animated,
            resizeWidth,
            resizeHeight,
            imgSettingThumbnailQuality,
            thumbnailPath
          )
          updateAttachment.thumfor = thumbnailPath
        }
      }
    } else if (config.imgSettingEnableImgThumbnail && !noThumbnail) {
      // 非HDR：原有缩略图流程
      const { imgSettingThumbnailMaxSize } = config
      // 如果图片尺寸大于最长边
      const max = Math.max(width, height)
      if (
        max > imgSettingThumbnailMaxSize &&
        imgSettingThumbnailMaxSize < imgSettingCompressMaxSize
      ) {
        // 计算压缩比例
        const scale = imgSettingThumbnailMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)

        updateAttachment.thumWidth = newWidth
        updateAttachment.thumHeight = newHeight

        // 压缩图片为webp 保存到 filePath 路径下
        const thumbnailPath = path.join(
          yearMonthPath,
          'thum-' + attachmentId + '.webp'
        )
        await utils.imageCompress(
          '.webp',
          fileData,
          animated,
          newWidth,
          newHeight,
          imgSettingThumbnailQuality,
          thumbnailPath
        )
        updateAttachment.thumfor = thumbnailPath
      }
    }

    // ===== 主图处理 =====
    if (isHDR) {
      // HDR图片：转换为HDR AVIF，忽略是否开启压缩，尺寸与既存压缩逻辑保持一致
      filePath = path.join(yearMonthPath, attachmentId + '.avif')
      attachment.mimetype = 'image/avif'

      const convertOptions = {
        quality: imgSettingHDRQuality,
        gainMapQuality: imgSettingHDRGainMapQuality,
        jobs: 'all',
        speed: imgSettingHDRAvifSpeed
      }
      const max = Math.max(width, height)
      if (max > imgSettingCompressMaxSize) {
        const scale = imgSettingCompressMaxSize / max
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)

        updateAttachment.width = newWidth
        updateAttachment.height = newHeight
        convertOptions.width = newWidth
        convertOptions.height = newHeight
      }
      await utils.convertJpegGainMap(tempJpgPath, filePath, convertOptions)
      updateAttachment.filepath = filePath
    } else if (imgSettingEnableImgCompress && !noCompress) {
      // 开启压缩
      if (imgSettingEnableImgCompressWebp) {
        filePath = path.join(yearMonthPath, attachmentId + '.webp')
        attachment.mimetype = 'image/webp'
      } else {
        filePath = path.join(yearMonthPath, attachmentId + extname)
      }

      // 如果图片尺寸大于最长边
      const max = Math.max(width, height)
      if (max > imgSettingCompressMaxSize) {
        // 计算压缩比例
        const scale = imgSettingCompressMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)

        updateAttachment.width = newWidth
        updateAttachment.height = newHeight
        // 压缩图片为webp 保存到 filePath 路径下
        await utils.imageCompress(
          imgSettingEnableImgCompressWebp ? '.webp' : extname,
          fileData,
          animated,
          newWidth,
          newHeight,
          imgSettingCompressQuality,
          filePath
        )
      } else {
        // 原尺寸压缩
        await utils.imageCompress(
          imgSettingEnableImgCompressWebp ? '.webp' : extname,
          fileData,
          animated,
          null,
          null,
          imgSettingCompressQuality,
          filePath
        )
      }
      updateAttachment.filepath = filePath
    } else {
      filePath = path.join(yearMonthPath, attachmentId + extname)
      // 不压缩，直接将fileData保存到filePath
      fs.writeFileSync(filePath, fileData)
      updateAttachment.filepath = filePath
    }

    // 记录是否为HDR图片（转换为HDR AVIF 或 手动标记为HDR）
    updateAttachment.isHDR = isHDR || markAsHDR
    // 更新数据库
    // 获取文件的filesize
    const stats = fs.statSync(filePath)
    updateAttachment.filesize = stats.size

    // 将updateAttachment的filepath和thumfor前面的public去掉，并将\替换为/
    updateAttachment.filepath = updateAttachment.filepath
      .replace('public', '')
      .replace(/\\/g, '/')
    updateAttachment.thumfor = updateAttachment.thumfor
      .replace('public', '')
      .replace(/\\/g, '/')
    updateAttachment.mimetype = attachment.mimetype

    const updateRes = await attachmentsUtils.updateOne(
      { _id: attachmentId },
      updateAttachment
    )
    if (updateRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [
          {
            message: '更新失败'
          }
        ]
      })
      return
    }
    // album的count+1
    albumUtils.updateOne({ _id: albumid }, { $inc: { count: 1 } })

    // 查询最新的附件信息
    const attachmentData = await attachmentsUtils.findOne({ _id: attachmentId })

    // 释放内存
    imageInfo = null
    // 发送响应
    res.send(attachmentData)
  } catch (err) {
    console.error(err)
    // 删除数据库 deleteOne
    attachmentsUtils.deleteOne({ _id: attachmentId })

    // 删除缓存文件
    res.status(400).json({
      errors: [
        {
          message: '文件上传失败'
        }
      ]
    })
  } finally {
    // 清理HDR临时文件
    if (tempJpgPath && fs.existsSync(tempJpgPath)) {
      try {
        fs.unlinkSync(tempJpgPath)
      } catch (unlinkErr) {
        console.error(`清理HDR临时文件失败: ${unlinkErr.message}`)
      }
    }
    // 无论是否发生异常，都释放内存
    fileData = null
    if (file) {
      file.buffer = null
      file = null
    }
  }
}
