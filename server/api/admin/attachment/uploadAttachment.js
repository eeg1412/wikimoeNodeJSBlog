const sharp = require('sharp');
const path = require('path');
const fs = require('fs')


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
   }
   */

  //  先将file.path的文件读取成buffer
  const fileData = fs.readFileSync(file.path)


  // TODO:album暂时写死
  const filePath = path.join('./public/content/uploadfile/', 'album', file.filename)


  try {
    // 如果开启了图片缩略图
    if (config.imgSettingEnableImgThumbnail && file.mimetype !== 'image/gif') {
      const { imgSettingThumbnailMaxSize } = config
      // 如果图片尺寸大于最长边
      // 读取图片信息
      const imageInfo = await sharp(fileData).metadata()
      const { width, height } = imageInfo
      const max = Math.max(width, height)
      if (max > imgSettingThumbnailMaxSize) {
        // 计算压缩比例
        const scale = imgSettingThumbnailMaxSize / max
        // 计算压缩后的宽高
        const newWidth = Math.round(width * scale)
        const newHeight = Math.round(height * scale)
        // 压缩图片为webp 保存到 filePath 路径下
        await sharp(fileData).resize(newWidth, newHeight).webp({ quality: 80 }).toFile(filePath + '_thumbnail')
      }
    }

    if (config.imgSettingEnableImgCompress) {
      // 如果开启了图片压缩
      const { imgSettingCompressQuality, imgSettingCompressMaxSize } = config
      // 如果图片尺寸大于最长边
      // 读取图片信息
      const imageInfo = await sharp(fileData).metadata()
      const { width, height } = imageInfo
      const animated = imageInfo.pages > 1
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
    } else {
      // 不压缩，直接将file.path的文件复制到filePath
      fs.copyFileSync(file.path, filePath)
    }
    // 删除缓存文件
    fs.unlinkSync(file.path)

    // 发送响应
    res.send({

    })
  } catch (err) {
    console.error(err)
    // 删除缓存文件
    res.status(400).json({
      errors: [{
        message: '文件上传失败'
      }]
    })
    fs.unlinkSync(file.path)
  }
}