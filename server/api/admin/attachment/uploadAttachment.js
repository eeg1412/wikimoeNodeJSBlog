const sharp = require('sharp');
const path = require('path');
const fs = require('fs')
const utils = require('../../../utils/utils')
const albumUtils = require('../../../mongodb/utils/albums')
const attachmentsUtils = require('../../../mongodb/utils/attachments')

module.exports = async function (req, res, next) {
  let { file } = req
  const headers = req.headers
  const albumid = headers['albumid']
  const noCompress = headers['x-no-compress'] === '1' ? true : false
  const noThumbnail = headers['x-no-thumbnail'] === '1' ? true : false

  let imgSettingCompressMaxSizeHeader = headers['x-compress-max-size']
  // 判断 imgSettingCompressMaxSizeHeader 是否是正整数
  if (imgSettingCompressMaxSizeHeader && !/^[1-9]\d*$/.test(imgSettingCompressMaxSizeHeader)) {
    // 如果不是正整数，就设置为默认值null
    imgSettingCompressMaxSizeHeader = null
  } else {
    imgSettingCompressMaxSizeHeader = parseInt(imgSettingCompressMaxSizeHeader)
  }

  // imgSettingCompressMaxSizeHeader 最小 为 1
  if (imgSettingCompressMaxSizeHeader !== null && imgSettingCompressMaxSizeHeader < 1) {
    imgSettingCompressMaxSizeHeader = null
  }
  if (!global.$globalConfig) {
    // 报错500
    res.status(500).json({
      errors: [{
        message: '配置项未初始化'
      }]
    })
    return
  }
  // 读取全局配置
  const config = JSON.parse(JSON.stringify(global.$globalConfig.imgSettings));
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
      errors: [{
        message: '请指定相册'
      }]
    })
    return
  }
  const album = await albumUtils.findOne({ _id: albumid })
  if (!album) {
    res.status(400).json({
      errors: [{
        message: '相册不存在'
      }]
    })
    return
  }

  const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
  // name去掉后缀名
  const name = originalname.replace(/\.[^/.]+$/, "")
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
  }
  // 保存到数据库
  const attachmentData = await attachmentsUtils.save(attachment)
  const attachmentId = attachmentData._id.toString()

  //  赋值buffer
  let fileData = file.buffer


  let filePath = ''
  // 获取后缀名
  let extname = path.extname(file.originalname)
  const updateAttachment = {
    filepath: '',
    filesize: file.size,
    width: 0,
    height: 0,
    thumfor: '',
    status: 1,
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
      fs.mkdirSync(yearMonthPath)
    }

    let imageInfo = await utils.imageMetadata(fileData)
    // 读取图片信息
    const { width, height } = imageInfo
    updateAttachment.width = width
    updateAttachment.height = height
    const animated = imageInfo.pages > 1
    // 配置
    const { imgSettingCompressQuality, imgSettingCompressMaxSize, imgSettingEnableImgCompressWebp, imgSettingThumbnailQuality, imgSettingEnableImgCompress } = config
    // 如果开启了图片缩略图
    if (config.imgSettingEnableImgThumbnail && !noThumbnail) {
      // 开启缩略图
      const { imgSettingThumbnailMaxSize } = config
      // 如果图片尺寸大于最长边

      const max = Math.max(width, height)
      if (max > imgSettingThumbnailMaxSize && imgSettingThumbnailMaxSize < imgSettingCompressMaxSize) {
        // 计算压缩比例
        const scale = imgSettingThumbnailMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)

        updateAttachment.thumWidth = newWidth
        updateAttachment.thumHeight = newHeight

        // 压缩图片为webp 保存到 filePath 路径下
        const thumbnailPath = path.join(yearMonthPath, 'thum-' + attachmentId + '.webp')
        await utils.imageCompress('.webp', fileData, animated, newWidth, newHeight, imgSettingThumbnailQuality, thumbnailPath)
        updateAttachment.thumfor = thumbnailPath
      }
    }

    if (imgSettingEnableImgCompress && !noCompress) {
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
        await utils.imageCompress(imgSettingEnableImgCompressWebp ? '.webp' : extname, fileData, animated, newWidth, newHeight, imgSettingCompressQuality, filePath)


      } else {
        // 原尺寸压缩
        await utils.imageCompress(imgSettingEnableImgCompressWebp ? '.webp' : extname, fileData, animated, null, null, imgSettingCompressQuality, filePath)
      }
      updateAttachment.filepath = filePath
    } else {
      filePath = path.join(yearMonthPath, attachmentId + extname)
      // 不压缩，直接将fileData保存到filePath
      fs.writeFileSync(filePath, fileData)
      updateAttachment.filepath = filePath
    }
    // 更新数据库
    // 获取文件的filesize
    const stats = fs.statSync(filePath)
    updateAttachment.filesize = stats.size

    // 将updateAttachment的filepath和thumfor前面的public去掉，并将\替换为/
    updateAttachment.filepath = updateAttachment.filepath.replace('public', '').replace(/\\/g, '/')
    updateAttachment.thumfor = updateAttachment.thumfor.replace('public', '').replace(/\\/g, '/')
    updateAttachment.mimetype = attachment.mimetype

    const updateRes = await attachmentsUtils.updateOne({ _id: attachmentId }, updateAttachment)
    if (updateRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
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
      errors: [{
        message: '文件上传失败'
      }]
    })
  } finally {
    // 无论是否发生异常，都释放内存
    fileData = null
    if (file) {
      file.buffer = null
      file = null
    }
  }
}