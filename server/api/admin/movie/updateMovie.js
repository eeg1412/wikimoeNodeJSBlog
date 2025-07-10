const movieUtils = require('../../../mongodb/utils/movies')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const fs = require('fs')
const nodePath = require('path')

module.exports = async function (req, res, next) {
  // moviename	String	是	否	无	电影名称
  const {
    title,
    cover,
    summary,
    rating,
    year,
    month,
    day,
    label,
    status,
    id,
    urlList,
    __v
  } = req.body
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [
        {
          message: '__v不能为空'
        }
      ]
    })
    return
  }
  if (year || month || day) {
    if (!utils.validateDate(year, month, day)) {
      res.status(400).json({
        errors: [
          {
            message: '日期格式不正确'
          }
        ]
      })
      return
    }
  }
  // 校验格式
  const params = {
    title,
    summary,
    rating,
    year,
    month,
    day,
    label,
    urlList,
    status
  }

  const oldData = await movieUtils.findOne({ _id: id, __v })
  if (!oldData) {
    res.status(400).json({
      errors: [
        {
          message: '该数据不存在或已被更新'
        }
      ]
    })
    return
  }
  const base64Reg = /^data:image\/\w+;base64,/
  if (cover && base64Reg.test(cover)) {
    const coverFolder = oldData.coverFolder
    let path = './public/upload/movie/'
    if (coverFolder) {
      path = path + coverFolder + '/'
    }
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      let baseCover = '/upload/movie/'
      // 拼接文件夹
      baseCover = baseCover + coverFolder + '/'
      params['cover'] = `${baseCover}${imgRes.fileNameAll}?v=${Date.now()}`
      params['coverFileName'] = imgRes.fileNameAll
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
  } else if (cover === '' && oldData.coverFileName) {
    // 删除封面
    const coverFolder = oldData.coverFolder
    let path = './public/upload/movie/'
    path = path + coverFolder + '/'
    const fileName = oldData.coverFileName
    try {
      fs.unlinkSync(nodePath.join(path, fileName))
    } catch (error) {
      adminApiLog.error(`movie update cover fail, ${JSON.stringify(error)}`)
      res.status(400).json({
        errors: [
          {
            message: '旧图片删除失败'
          }
        ]
      })
      return
    }
    params['cover'] = null
    params['coverFileName'] = null
  }

  // updateOne
  movieUtils
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
      adminApiLog.info(`movie update success`)
      cacheDataUtils.getMovieYearList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '电影更新失败'
          }
        ]
      })
      adminApiLog.error(`movie update fail, ${logErrorToText(err)}`)
    })
}
