const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const mongoose = require('mongoose')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {

  const { title, cover, summary, rating, year, season, label, status } = req.body
  // 校验格式
  const params = {
    title,
    cover,
    summary,
    rating,
    year,
    season,
    label,
    status
  }

  const base64Reg = /^data:image\/\w+;base64,/
  if (cover && base64Reg.test(cover)) {
    // 事先生成_id
    params['_id'] = new mongoose.Types.ObjectId()
    const path = './public/upload/bangumi/'
    const fileName = params['_id']
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName)
      params['cover'] = `/upload/bangumi/${imgRes.fileNameAll}?v=${Date.now()}`
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '照片上传失败'
        }]
      })
      throw new Error(error)
    }
  }

  // save
  bangumiUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`bangumi create success`)
    cacheDataUtils.getBangumiYearList()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '追番创建失败'
      }]
    })
    adminApiLog.error(`bangumi create fail, ${JSON.stringify(err)}`)
  })

}
