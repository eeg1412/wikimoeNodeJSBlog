const linkUtils = require('../../../mongodb/utils/links')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const nodePath = require('path')

module.exports = async function (req, res, next) {
  const { id, __v } = req.body
  const { icon, sitename, siteurl, description, taxis, status, rss } = req.body
  // 校验格式
  const params = {
    sitename,
    siteurl,
    description: description || '',
    taxis: taxis || 0,
    status: status || 0,
    rss: rss || ''
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
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
      key: 'sitename',
      label: '网站名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'siteurl',
      label: '网站URL',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'taxis',
      label: '排序',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  //图标上传
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (icon && base64Reg.test(icon)) {
    const path = './public/upload/linkicon/'
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(icon, path, fileName, {
        createDir: true
      })
      params['icon'] = `/upload/linkicon/${imgRes.fileNameAll}?v=${Date.now()}`
      params['iconPath'] = imgRes.filepath
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '照片上传失败'
          }
        ]
      })
      throw new Error(error)
    }
  } else if (icon === '') {
    // 删除图标
    const oldData = await linkUtils.findOne({ _id: id, __v })
    if (oldData && oldData.iconPath) {
      try {
        fs.unlinkSync(nodePath.join('./', oldData.iconPath))
      } catch (error) {
        adminApiLog.error(`link delete icon fail, ${JSON.stringify(error)}`)
      }
    }
    params['icon'] = null
    params['iconPath'] = null
  }
  // updateOne
  linkUtils
    .updateOne({ _id: id, __v }, params)
    .then(data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
      // utils.reflushBlogCache()
      adminApiLog.info(`link update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '友链更新失败'
          }
        ]
      })
      adminApiLog.error(`link update fail, ${logErrorToText(err)}`)
    })
}
