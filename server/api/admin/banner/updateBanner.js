const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {
  const {
    _id,
    title,
    status,
    link,
    isdefault,
    newtab,
    img
  } = req.body
  if (!_id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  const params = {
    title: title || '',
    status: status || 0,
    link: link || '',
    isdefault: isdefault ? true : false,
    newtab: newtab ? true : false,
  }
  // 如果状态为1，img必填
  if (status === 1 && !img) {
    res.status(400).json({
      errors: [{
        message: '图片不能为空'
      }]
    })
    return
  }
  const base64Reg = /^data:image\/\w+;base64,/
  if (img && base64Reg.test(img)) {
    // img是base64，需要转换成图片并储存
    const path = './public/upload/banner/'
    const fileName = _id
    try {
      const imgRes = utils.base64ToFile(img, path, fileName)
      params['img'] = `/upload/banner/${imgRes.fileNameAll}?v=${Date.now()}`
      params['imgPath'] = imgRes.filepath
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '照片上传失败'
        }]
      })
      throw new Error(error)
    }
  }
  // updateOne
  bannerUtils.updateOne({ _id: _id }, params).then((data) => {
    // 判断是否更新成功
    if (data.modifiedCount === 0) {
      // 记录
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`banner update success`)
    cacheDataUtils.getBannerList()
    utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新失败'
      }]
    })
    adminApiLog.error(`banner update fail, ${logErrorToText(err)}`)
  })



}
