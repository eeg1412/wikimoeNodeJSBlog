const movieUtils = require('../../../mongodb/utils/movies')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const mongoose = require('mongoose')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const {
    title,
    cover,
    summary,
    rating,
    year,
    month,
    day,
    label,
    urlList,
    postLinkOpen,
    status
  } = req.body
  // 校验格式
  const params = {
    title,
    cover,
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
  const rule = [
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
  const errors = utils.checkForm(params, rule)
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
  // 根据当前年份生成16进制文件夹
  const coverNow = new Date()
  const coverYear = coverNow.getFullYear()
  // 16进制
  const coverYear16 = coverYear.toString(16)
  params['coverFolder'] = coverYear16

  const base64Reg = /^data:image\/\w+;base64,/
  if (cover && base64Reg.test(cover)) {
    // 事先生成_id
    params['_id'] = new mongoose.Types.ObjectId()
    let path = './public/upload/movie/'
    const fileName = params['_id']
    path = path + coverYear16 + '/'
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      params['cover'] = `/upload/movie/${coverYear16}/${
        imgRes.fileNameAll
      }?v=${Date.now()}`
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
  }

  // save
  movieUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      cacheDataUtils.getMovieYearList()
      adminApiLog.info(`movie create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '电影创建失败'
          }
        ]
      })
      adminApiLog.error(`movie create fail, ${logErrorToText(err)}`)
    })
}
