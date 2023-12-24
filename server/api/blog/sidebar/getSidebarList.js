const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

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
      userApiLog.error(`sidebar list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
