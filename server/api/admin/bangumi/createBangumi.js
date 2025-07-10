const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const mongoose = require('mongoose')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const fs = require('fs')

module.exports = async function (req, res, next) {
  const {
    title,
    cover,
    summary,
    rating,
    year,
    season,
    label,
    urlList,
    giveUp,
    status,
  } = req.body
  // 校验格式
  const params = {
    title,
    cover,
    summary,
    rating,
    year,
    season,
    label,
    urlList,
    giveUp,
    status,
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
    let path = './public/upload/bangumi/'
    const fileName = params['_id']
    path = path + coverYear16 + '/'
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true,
      })
      params['cover'] =
        `/upload/bangumi/${coverYear16}/${imgRes.fileNameAll}?v=${Date.now()}`
      params['coverFileName'] = imgRes.fileNameAll
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '照片上传失败',
          },
        ],
      })
      throw new Error(error)
    }
  }

  // save
  bangumiUtils
    .save(params)
    .then((data) => {
      res.send({
        data: data,
      })
      adminApiLog.info(`bangumi create success`)
      cacheDataUtils.getBangumiYearList()
      cacheDataUtils.getBangumiSeasonList()
      // utils.reflushBlogCache()
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '番剧创建失败',
          },
        ],
      })
      adminApiLog.error(`bangumi create fail, ${logErrorToText(err)}`)
    })
}
