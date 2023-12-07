const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const {
    _id,
    title,
    status,
    link
  } = req.body
  if (!_id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  const params = {
    title: title || '',
    status: status || 0,
    link: link || ''
  }
  // updateOne
  bannerUtils.updateOne({ _id: _id }, params).then((data) => {
    // 判断是否更新成功
    if (data.nModified === 0) {
      // 记录
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
    adminApiLog.info(`banner update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新失败'
      }]
    })
    adminApiLog.error(`banner update fail, ${JSON.stringify(err)}`)
  })



}
