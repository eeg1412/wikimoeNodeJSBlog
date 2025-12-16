const naviUtils = require('../../../mongodb/utils/navis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({ errors: [{ message: 'id格式错误' }] })
    return
  }
  //  删除导航
  naviUtils
    .deleteOne({ _id: id })
    .then(data => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败'
            }
          ]
        })
        return
      }
      res.send({
        data: {
          message: '删除成功'
        }
      })
      cacheDataUtils.getNaviList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`navi delete fail, ${logErrorToText(err)}`)
    })
}
