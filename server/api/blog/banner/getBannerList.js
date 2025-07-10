const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.bannerList) {
    res.send(global.$cacheData.bannerList)
  } else {
    cacheDataUtils
      .getBannerList()
      .then(data => {
        res.send(data)
      })
      .catch(err => {
        res.status(400).json({
          errors: [
            {
              message: 'banner列表获取失败'
            }
          ]
        })
        userApiLog.error(`banner list get fail, ${JSON.stringify(err)}`)
      })
  }
}
