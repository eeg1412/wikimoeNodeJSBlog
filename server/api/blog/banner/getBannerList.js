const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.bannerList) {
    res.send(global.$cacheData.bannerList)
  } else {
    cacheDataUtils.getBannerList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'banner列表获取失败'
        }]
      })
      adminApiLog.error(`banner list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
