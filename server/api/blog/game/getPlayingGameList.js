const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.getPlayingGameList) {
    res.send(global.$cacheData.getPlayingGameList)
  } else {
    cacheDataUtils.getPlayingGameList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'getPlayingGameList 列表获取失败'
        }]
      })
      userApiLog.error(`getPlayingGameList fail, ${JSON.stringify(err)}`)
    })
  }
}
