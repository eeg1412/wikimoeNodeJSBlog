const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  if (global.$cacheData?.commentList) {
    res.send(global.$cacheData.commentList)
  } else {
    cacheDataUtils
      .getCommentList()
      .then((data) => {
        res.send(data)
      })
      .catch((err) => {
        res.status(400).json({
          errors: [
            {
              message: 'comment列表获取失败',
            },
          ],
        })
        userApiLog.error(`comment list get fail, ${JSON.stringify(err)}`)
      })
  }
}
