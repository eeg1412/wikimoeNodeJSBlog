const path = require('path');
const fs = require('fs')
const utils = require('../../../utils/utils')
const albumUtils = require('../../../mongodb/utils/albums')
const attachmentsUtils = require('../../../mongodb/utils/attachments')
const ObjectId = require('mongodb').ObjectId

module.exports = async function (req, res, next) {
  let { width, height, albumid, filename, filesize } = req.body
  const files = req.files
  const headers = req.headers

  // 获取files里的video和cover，都是数组，所以取第一个，注意可能files和files.video都不存在
  let video = files?.video ? files.video[0] : null
  let cover = files?.cover ? files.cover[0] : null

  if (!video) {
    res.status(400).json({
      errors: [{
        message: '请上传视频'
      }]
    })
    return
  }
  if (!cover) {
    res.status(400).json({
      errors: [{
        message: '封面图缺失'
      }]
    })
    return
  }
  // 宽高必须存在
  if (!width || !height) {
    res.status(400).json({
      errors: [{
        message: '请指定视频宽高'
      }]
    })
    return
  }
  // 宽高转换成数字
  width = Number(width)
  height = Number(height)


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

  // 写入文件
  // 生成ObjectId
  const videoId = new ObjectId()
  const attachment = {
    _id: videoId,
    name: filename || '',
    filename: filename || '',
    filesize: video.size,
    filepath: '',
    width: width || 0,
    height: height || 0,
    // mp4格式
    mimetype: 'video/mp4',
    thumfor: '',
    thumWidth: width || 0,
    thumHeight: height || 0,
    album: albumid,
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


  // 将video保存到
  const videoPath = path.join(yearMonthPath, `${videoId}.mp4`)
  fs.writeFileSync(videoPath, video.buffer)
  attachment.filepath = `/content/uploadfile/${yearMonth}/${videoId}.mp4`
  // 将封面图保存到
  const coverPath = path.join(yearMonthPath, `thum-${videoId}.webp`)
  fs.writeFileSync(coverPath, cover.buffer)
  attachment.thumfor = `/content/uploadfile/${yearMonth}/thum-${videoId}.webp`

  // 保存到数据库
  attachmentsUtils.save(attachment).then((data) => {
    res.send(data)
  }).catch((err) => {
    console.error(err)
    res.status(400).json({
      errors: [{
        message: '文件上传失败'
      }]
    })
  })
  // album的count+1
  albumUtils.updateOne({ _id: album._id }, { $inc: { count: 1 } })
  // 释放内存
  video = null
  cover = null

}
