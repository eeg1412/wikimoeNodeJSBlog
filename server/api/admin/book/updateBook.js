const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const nodePath = require('path')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  // bookname	String	是	否	无	书籍名称
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
    status,
    giveUp,
    postLinkOpen,
    id,
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
  // 校验格式
  const params = {
    title: title,
    booktype: booktype,
    summary: summary,
    rating: rating,
    label: label,
    urlList: urlList,
    startTime: startTime,
    endTime: endTime,
    status: status,
    postLinkOpen: postLinkOpen,
    giveUp: giveUp
  }
  const rule = [
    {
      key: 'title',
      label: '书籍名称',
      type: null,
      required: true
    },
    {
      key: 'booktype',
      label: '书籍类型',
      type: 'isMongoId',
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const oldData = await bookUtils.findOne({ _id: id, __v })
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
    let path = './public/upload/bookCover/'
    if (coverFolder) {
      path = path + coverFolder + '/'
    }
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      let baseCover = '/upload/bookCover/'
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
    let path = './public/upload/bookCover/'
    path = path + coverFolder + '/'
    const fileName = oldData.coverFileName
    try {
      fs.unlinkSync(nodePath.join(path, fileName))
    } catch (error) {
      adminApiLog.error(`bookCover update cover fail, ${JSON.stringify(error)}`)
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
  bookUtils
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
      adminApiLog.info(`book update success`)
      cacheDataUtils.getReadingBookList()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '书籍更新失败'
          }
        ]
      })
      adminApiLog.error(`book update fail, ${logErrorToText(err)}`)
    })
}
