const linkUtils = require('../../../mongodb/utils/links')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose');

module.exports = async function (req, res, next) {
  // // sitename 网站名称字段
  // sitename: {
  //   type: String,
  //   default: '',
  //   // 必填
  //   required: true
  // },
  // // siteurl	网站URL字段
  // siteurl: {
  //   type: String,
  //   default: '',
  //   // 必填
  //   required: true
  // },
  // // description	描述字段
  // description: {
  //   type: String,
  //   default: ''
  // },
  // // taxis	排序字段
  // taxis: {
  //   type: Number,
  //   default: 0
  // },
  // // status  状态字段：0不显示，1显示
  // status: {
  //   type: Number,
  //   default: 1
  // },
  // RSS地址
  // rss: {
  //   type: String,
  //   default: '',
  // },
  const {
    icon,
    sitename,
    siteurl,
    description,
    taxis,
    status,
    rss
  } = req.body
  // 校验格式
  const params = {
    sitename,
    siteurl,
    description: description || '',
    taxis: taxis || 0,
    status: status || 0,
    rss: rss || ''
  }
  const rule = [
    {
      key: 'sitename',
      label: '网站名称',
      type: null,
      required: true,
    },
    {
      key: 'siteurl',
      label: '网站URL',
      type: null,
      required: true,
    },

  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  //图标上传
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (icon && base64Reg.test(icon)) {
    // 事先生成_id
    params['_id'] = new mongoose.Types.ObjectId()
    const path = './public/upload/linkicon/'
    const fileName = params['_id']
    try {
      const imgRes = utils.base64ToFile(icon, path, fileName)
      params['icon'] = `/upload/linkicon/${imgRes.fileNameAll}?v=${Date.now()}`
      params['iconPath'] = imgRes.filepath
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '照片上传失败'
        }]
      })
      throw new Error(error)
    }
  }

  // save
  linkUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    utils.reflushBlogCache()
    adminApiLog.info(`link create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '友链创建失败'
      }]
    })
    adminApiLog.error(`link create fail, ${logErrorToText(err)}`)
  })

}
