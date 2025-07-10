const utils = require('../../../utils/utils')
const fs = require('fs')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const path = require('path')

module.exports = async function (req, res, next) {
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
  let {
    imgSettingEnableImgCompress,
    imgSettingEnableImgCompressWebp,
    imgSettingCompressQuality,
    imgSettingCompressMaxSize,
    imgSettingEnableImgThumbnail,
    imgSettingThumbnailQuality,
    imgSettingThumbnailMaxSize
  } = req.body
  // 校验格式
  const params = {
    imgSettingEnableImgCompress: imgSettingEnableImgCompress,
    imgSettingEnableImgCompressWebp: imgSettingEnableImgCompressWebp,
    imgSettingCompressQuality: imgSettingCompressQuality,
    imgSettingCompressMaxSize: imgSettingCompressMaxSize,
    imgSettingEnableImgThumbnail: imgSettingEnableImgThumbnail,
    imgSettingThumbnailQuality: imgSettingThumbnailQuality,
    imgSettingThumbnailMaxSize: imgSettingThumbnailMaxSize
  }
  const rule = [
    {
      key: 'imgSettingEnableImgCompress',
      label: '开启图片压缩',
      type: 'isBoolean'
    },
    {
      key: 'imgSettingEnableImgCompressWebp',
      label: '图片压缩为webp格式',
      type: 'isBoolean'
    },
    {
      key: 'imgSettingCompressQuality',
      label: '图片压缩质量',
      type: 'isInt',
      required: true
    },
    {
      key: 'imgSettingCompressMaxSize',
      label: '图片压缩最长边',
      type: 'isInt',
      required: true
    },
    {
      key: 'imgSettingEnableImgThumbnail',
      label: '开启图片缩略图',
      type: 'isBoolean'
    },
    {
      key: 'imgSettingThumbnailQuality',
      label: '图片缩略图质量',
      type: 'isInt',
      required: true
    },
    {
      key: 'imgSettingThumbnailMaxSize',
      label: '图片缩略图最长边',
      type: 'isInt',
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 写入配置文件
  // 判断globalConfig.json文件是否存在,如果不存在就创建,如果存在就覆盖
  const globalConfigPath = path.join('./config/globalConfig.json')
  fs.writeFileSync(globalConfigPath, JSON.stringify(params))
  // 和现有的global.$globalConfig合并
  Object.assign(global.$globalConfig, params)
  // 写入日志
  adminApiLog.info(`更新全局配置:${JSON.stringify(params)}`)
  console.info(`当前全局配置:`, global.$globalConfig)
  res.send({
    data: global.$globalConfig
  })
}
