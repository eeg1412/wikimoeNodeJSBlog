const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // banguminame	String	是	否	无	追番名称
  const { title, cover, summary, rating, year, season, label, status, id, __v } = req.body
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
    const path = './public/upload/bangumi/'
    const fileName = id
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
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '追番更新失败'
      }]
    })
    adminApiLog.error(`bangumi update fail, ${JSON.stringify(err)}`)
  })
}
