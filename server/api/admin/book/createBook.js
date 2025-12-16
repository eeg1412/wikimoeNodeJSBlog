const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const {
    booktype,
    title,
    cover,
    summary,
    rating,
    label,
    urlList,
    startTime,
    endTime,
    giveUp,
    postLinkOpen,
    status
  } = req.body
  // 校验格式
  const params = {
    booktype,
    title,
    cover,
    summary,
    rating,
    label,
    urlList,
    startTime,
    endTime,
    giveUp,
    postLinkOpen,
    status
  }
  const rule = [
    {
      key: 'title',
      label: '书籍名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'booktype',
      label: '书籍类型',
      type: 'isMongoId',
      required: true
    },
    {
      key: 'rating',
      label: '评分',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'giveUp',
      label: '弃坑',
      strict: true,
      strictType: 'boolean'
    },
    {
      key: 'postLinkOpen',
      label: '文章链接公开',
      strict: true,
      strictType: 'boolean'
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
    let path = './public/upload/bookCover/'
    const fileName = params['_id']
    path = path + coverYear16 + '/'
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      params['cover'] = `/upload/bookCover/${coverYear16}/${
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
  bookUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`book create success`)
      cacheDataUtils.getReadingBookList()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '书籍创建失败'
          }
        ]
      })
      adminApiLog.error(`book create fail, ${logErrorToText(err)}`)
    })
}
