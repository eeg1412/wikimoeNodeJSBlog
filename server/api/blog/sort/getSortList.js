const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.sortList) {
    res.send(global.$cacheData.sortList)
  } else {
    cacheDataUtils
      .getSortList()
      .then((data) => {
        res.send(data)
      })
      .catch((err) => {
        res.status(400).json({
          errors: [
            {
              message: 'sort列表获取失败',
            },
          ],
        })
        userApiLog.error(`sort list get fail, ${JSON.stringify(err)}`)
      })
  }
}
