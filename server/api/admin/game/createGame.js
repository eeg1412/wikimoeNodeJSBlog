const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
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
    postLinkOpen,
    giveUp
  } = req.body
  // 校验格式
  const params = {
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
    postLinkOpen,
    giveUp
  }
  const rule = [
    {
      key: 'title',
      label: '游戏名称',
      type: null,
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
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
    let path = './public/upload/gameCover/'
    const fileName = params['_id']
    path = path + coverYear16 + '/'
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      params['cover'] = `/upload/gameCover/${coverYear16}/${
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
  gameUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`game create success`)
      cacheDataUtils.getPlayingGameList()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '游戏创建失败'
          }
        ]
      })
      adminApiLog.error(`game create fail, ${logErrorToText(err)}`)
    })
}
