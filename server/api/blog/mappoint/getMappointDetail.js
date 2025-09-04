const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }

  // 只获取状态为显示的地图点
  const params = {
    _id: id,
    status: 1
  }

  // findOne
  mappointUtils
    .findOne(params, null, { lean: true })
    .then(data => {
      if (!data) {
        res.status(404).json({
          errors: [
            {
              message: '地图标记点不存在'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '地图标记点详情获取失败'
          }
        ]
      })
      userApiLog.error(`mappoint detail get fail, ${logErrorToText(err)}`)
    })
}
