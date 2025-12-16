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
    postLinkOpen,
    __v
  } = req.body
  // 校验格式
  const params = {
    title,
    summary,
    rating,
    year,
    month,
    day,
    label,
    status,
    urlList,
    postLinkOpen
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
      key: 'title',
      label: '标题',
      type: null,
      required: false,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'rating',
      label: '评分',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'year',
      label: '年份',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'month',
      label: '月份',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'day',
      label: '日期',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'postLinkOpen',
      label: '文章链接公开',
      strict: true,
      strictType: 'boolean'
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

  // urlList 检查
  if (!utils.checkStringList(urlList, ['text', 'url'])) {
    res.status(400).json({
      errors: [
        {
          message: '链接列表格式错误'
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
  const updateData = {
    title,
    summary,
    rating,
    year,
    month,
    day,
    label,
    urlList,
    postLinkOpen,
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
      updateData['cover'] = `${baseCover}${imgRes.fileNameAll}?v=${Date.now()}`
      updateData['coverFileName'] = imgRes.fileNameAll
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
    updateData['cover'] = null
    updateData['coverFileName'] = null
  }

  // updateOne
  movieUtils
    .updateOne({ _id: id, __v }, updateData)
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
