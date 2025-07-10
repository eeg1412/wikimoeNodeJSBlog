const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.bangumiSeasonObj) {
    cacheDataUtils
      .checkBangumiSeasonList()
      .then(data => {
        res.send(data.list)
      })
      .catch(err => {
        res.status(400).json({
          errors: [
            {
              message: '当季追番列表获取失败'
            }
          ]
        })
        userApiLog.error(
          `checkBangumiSeasonList get fail, ${JSON.stringify(err)}`
        )
      })
  } else {
    cacheDataUtils
      .getBangumiSeasonList()
      .then(data => {
        res.send(data.list)
      })
      .catch(err => {
        res.status(400).json({
          errors: [
            {
              message: '当季追番列表获取失败'
            }
          ]
        })
        userApiLog.error(
          `getBangumiSeasonList get fail, ${JSON.stringify(err)}`
        )
      })
  }
}
