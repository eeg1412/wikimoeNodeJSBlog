const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

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
      userApiLog.error(`navi list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
