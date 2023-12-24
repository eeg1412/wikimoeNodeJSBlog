const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.postArchiveList) {
    res.send(global.$cacheData.postArchiveList)
  } else {
    cacheDataUtils.getPostArchiveList().then((data) => {
      res.send(data)
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: 'postArchive列表获取失败'
        }]
      })
      userApiLog.error(`postArchive list get fail, ${JSON.stringify(err)
        }`)
    })
  }
}
