const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { title, taxis, img, link } = req.body
  // 校验格式
  const params = {
    title: title || '',
    taxis: taxis || 0,
    link: link || ''
  }
  // save
  bannerUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`banner create success`)
      cacheDataUtils.getBannerList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '横幅创建失败'
          }
        ]
      })
      adminApiLog.error(`banner create fail, ${logErrorToText(err)}`)
    })
}
