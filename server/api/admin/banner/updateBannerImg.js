const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {
  // bannername	String	是	否	无	横幅名称
  const { img, _id } = req.body
  if (!_id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }

  // 校验格式
  const params = {
    img: img,
  }
  const rule = [
    {
      key: 'img',
      label: '图片',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (!base64Reg.test(img)) {
    res.status(400).json({
      errors: [{
        message: '图片格式不正确'
      }]
    })
    return
  }
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

  // updateOne
  bannerUtils.updateOne({ _id: _id }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: {
        img: params.img
      }
    })
    adminApiLog.info(`banner update success`)
    cacheDataUtils.getBannerList()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '横幅更新失败'
      }]
    })
    adminApiLog.error(`banner update fail, ${JSON.stringify(err)}`)
  })
}
