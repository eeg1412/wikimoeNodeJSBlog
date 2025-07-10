const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.bangumiYearList) {
    res.send({
      data: global.$cacheData.bangumiYearList,
    })
  } else {
    cacheDataUtils
      .getBangumiYearList()
      .then((data) => {
        res.send({
          data,
        })
      })
      .catch((err) => {
        res.status(400).json({
          errors: [
            {
              message: '番剧年份列表获取失败',
            },
          ],
        })
        userApiLog.error(`bangumi list get fail, ${JSON.stringify(err)}`)
      })
  }
}
