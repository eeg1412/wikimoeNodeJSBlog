const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.naviList) {
    res.send({
      data: global.$cacheData.naviList
    })
  } else {
    cacheDataUtils.getNaviList().then((data) => {
      res.send({
        data
      })
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '导航列表获取失败'
        }]
      })
      adminApiLog.error(`navi list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
