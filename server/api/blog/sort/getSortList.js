const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.sortList) {
    res.send(global.$cacheData.sortList)
  } else {
    cacheDataUtils.getSortList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'sort列表获取失败'
        }]
      })
      adminApiLog.error(`sort list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
