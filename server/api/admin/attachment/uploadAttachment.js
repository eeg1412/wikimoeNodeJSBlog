const sharp = require('sharp');
const path = require('path');
const fs = require('fs')
const albumUtils = require('../../../mongodb/utils/albums')
const attachmentsUtils = require('../../../mongodb/utils/attachments')


module.exports = async function (req, res, next) {
  const { file } = req
  const headers = req.headers
  const albumid = headers['albumid']
  // 读取全局配置
  const config = global.$globalConfig;
  // // 开启图片压缩
  // imgSettingEnableImgCompress: false,
  // // 图片压缩质量
  // imgSettingCompressQuality: 80,
  // // 图片压缩最长边
  // imgSettingCompressMaxSize: 1920,
  // // 开启图片缩略图
  // imgSettingEnableImgThumbnail: false,
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
  const album = await albumUtils.findOne({ _id: albumid })
  if (!album) {
    res.status(400).json({
      errors: [{
        message: '相册不存在'
      }]
    })
    return
  }
  // 相册name
  const albumName = album.name
  // 数据库添加信息
  const attachment = {
    filename: file.originalname,
    filesize: file.size,
    filepath: '',
    width: 0,
    height: 0,
    mimetype: file.mimetype,
    thumfor: '',
    album: albumid,
  }
  // 保存到数据库
  const attachmentData = await attachmentsUtils.save(attachment)
  const attachmentId = attachmentData._id

  //  赋值buffer
  let fileData = file.buffer


  let filePath = ''
  // path.join('./public/content/uploadfile/', albumName, attachmentId)
  // 获取后缀名
  let extname = path.extname(file.originalname)
  const updateAttachment = {
    filepath: '',
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
    const image = sharp(fileData)
    const imageInfo = await image.metadata()
    // 读取图片信息
    const { width, height } = imageInfo
    updateAttachment.width = width
    updateAttachment.height = height
    // 如果开启了图片缩略图
    if (config.imgSettingEnableImgThumbnail) {
      // 开启缩略图
      const { imgSettingThumbnailMaxSize } = config
      // 如果图片尺寸大于最长边

      const max = Math.max(width, height)
      if (max > imgSettingThumbnailMaxSize) {
        // 计算压缩比例
        const scale = imgSettingThumbnailMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)
        updateAttachment.width = newWidth
        updateAttachment.height = newHeight
        // 压缩图片为webp 保存到 filePath 路径下
        const thumbnailPath = path.join('./public/content/uploadfile/', albumName, 'thum-' + attachmentId + '.webp')
        await image.resize(newWidth, newHeight).webp({ quality: 80 }).toFile(thumbnailPath)
        updateAttachment.thumfor = thumbnailPath
      }
    }

    if (config.imgSettingEnableImgCompress) {
      // 开启压缩
      filePath = path.join('./public/content/uploadfile/', albumName, attachmentId + '.webp')
      const { imgSettingCompressQuality, imgSettingCompressMaxSize } = config

      const animated = imageInfo.pages > 1
      // 如果图片尺寸大于最长边
      const max = Math.max(width, height)
      if (max > imgSettingCompressMaxSize) {
        // 计算压缩比例
        const scale = imgSettingCompressMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)
        // 压缩图片为webp 保存到 filePath 路径下
        await sharp(fileData, {
          animated,
        }).resize(newWidth, newHeight).webp({ quality: imgSettingCompressQuality }).toFile(filePath)
      } else {
        // 原尺寸压缩
        await sharp(fileData, {
          animated,
        }).webp({ quality: imgSettingCompressQuality }).toFile(filePath)
      }
      updateAttachment.filepath = filePath
    } else {
      filePath = path.join('./public/content/uploadfile/', albumName, attachmentId + extname)
      // 不压缩，直接将fileData保存到filePath
      fs.writeFileSync(filePath, fileData)
      updateAttachment.filepath = filePath
    }
    // 释放内存
    fileData = null
    file.buffer = null
    // 更新数据库
    const updateRes = await attachmentsUtils.updateOne({ _id: attachmentId }, updateAttachment)
    if (updateRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }


    // 发送响应
    res.send({

    })
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
    // 释放内存
    fileData = null
    file.buffer = null
  }
}