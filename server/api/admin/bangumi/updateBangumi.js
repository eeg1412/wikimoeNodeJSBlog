const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const fs = require('fs');
const nodePath = require('path')

module.exports = async function (req, res, next) {
  // banguminame	String	是	否	无	番剧名称
  const { title, cover, summary, rating, year, season, label, status, id, urlList, __v } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    title,
    summary,
    rating,
    year,
    season,
    label,
    urlList,
    status
  }

  const oldData = await bangumiUtils.findOne({ _id: id, __v })
  if (!oldData) {
    res.status(400).json({
      errors: [{
        message: '该数据不存在或已被更新'
      }]
    })
    return
  }
  const base64Reg = /^data:image\/\w+;base64,/
  if (cover && base64Reg.test(cover)) {
    const coverFolder = oldData.coverFolder
    let path = './public/upload/bangumi/'
    if (coverFolder) {
      path = path + coverFolder + '/'
    }
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, { createDir: true })
      let baseCover = '/upload/bangumi/'
      // 拼接文件夹
      baseCover = baseCover + coverFolder + '/'
      params['cover'] = `${baseCover}${imgRes.fileNameAll}?v=${Date.now()}`
      params['coverFileName'] = imgRes.fileNameAll
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '照片上传失败'
        }]
      })
      throw new Error(error)
    }
  } else if (cover === '' && oldData.coverFileName) {
    // 删除封面
    const coverFolder = oldData.coverFolder
    let path = './public/upload/bangumi/'
    path = path + coverFolder + '/'
    const fileName = oldData.coverFileName
    try {
      fs.unlinkSync(nodePath.join(path, fileName))
    } catch (error) {
      adminApiLog.error(`bangumi update cover fail, ${JSON.stringify(error)}`)
      res.status(400).json({
        errors: [{
          message: '旧图片删除失败'
        }]
      })
      return
    }
    params['cover'] = null
    params['coverFileName'] = null
  }

  // updateOne
  bangumiUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
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
    adminApiLog.info(`bangumi update success`)
    cacheDataUtils.getBangumiYearList()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '番剧更新失败'
      }]
    })
    adminApiLog.error(`bangumi update fail, ${logErrorToText(err)}`)
  })
}
