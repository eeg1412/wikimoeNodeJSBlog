const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const nodePath = require('path')

module.exports = async function (req, res, next) {
  // gamePlatform: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'gamePlatform',
  // },
  // // 标题
  // title: {
  //   type: String,
  //   required: true
  // },
  // // 封面
  // cover: {
  //   type: String,
  // },
  // coverFolder: {
  //   type: String,
  //   default: null
  // },
  // coverFileName: {
  //   type: String,
  //   default: null
  // },
  // // 简评
  // summary: {
  //   type: String,
  // },
  // // 评分，神作，佳作，良作，劣作，烂作，迷
  // rating: {
  //   type: Number,
  // },
  // // label 字符串数组
  // label: {
  //   type: [String],
  //   default: []
  // },
  // screenshotAlbum: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'albums'
  // },
  // urlList: {
  //   type: [String],
  //   default: []
  // },
  // // 游玩开始时间
  // startTime: {
  //   type: Date,
  // },
  // // 游玩结束时间
  // endTime: {
  //   type: Date,
  // },
  // // 状态 0: 不显示 1: 显示
  // status: {
  //   type: Number,
  //   default: 0
  // },
  const {
    gamePlatform,
    title,
    cover,
    summary,
    rating,
    label,
    screenshotAlbum,
    urlList,
    startTime,
    endTime,
    status,
    id,
    __v
  } = req.body
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
    title: title,
    gamePlatform: gamePlatform,
    summary: summary,
    rating: rating,
    label: label,
    screenshotAlbum: screenshotAlbum,
    urlList: urlList,
    startTime: startTime,
    endTime: endTime,
    status: status,
  }
  const rule = [
    {
      key: 'title',
      label: '游戏名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const oldData = await gameUtils.findOne({ _id: id, __v })
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
    let path = './public/upload/gameCover/'
    if (coverFolder) {
      path = path + coverFolder + '/'
    }
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, { createDir: true })
      let baseCover = '/upload/gameCover/'
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
    let path = './public/upload/gameCover/'
    path = path + coverFolder + '/'
    const fileName = oldData.coverFileName
    try {
      fs.unlinkSync(nodePath.join(path, fileName))
    } catch (error) {
      adminApiLog.error(`gameCover update cover fail, ${JSON.stringify(error)}`)
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
  gameUtils.updateOne({ _id: id, __v }, params).then((data) => {
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
    adminApiLog.info(`game update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '游戏更新失败'
      }]
    })
    adminApiLog.error(`game update fail, ${logErrorToText(err)}`)
  })
}
