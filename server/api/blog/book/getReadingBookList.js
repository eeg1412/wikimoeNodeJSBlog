const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.getReadingBookList) {
    res.send(global.$cacheData.getReadingBookList)
  } else {
    cacheDataUtils.getReadingBookList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'getReadingBookList 列表获取失败'
        }]
      })
      userApiLog.error(`getReadingBookList fail, ${JSON.stringify(err)}`)
    })
  }
}
