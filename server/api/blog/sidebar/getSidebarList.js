const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.sidebarList) {
    res.send(global.$cacheData.sidebarList)
  } else {
    cacheDataUtils.getSidebarList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'sidebar列表获取失败'
        }]
      })
      adminApiLog.error(`sidebar list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
