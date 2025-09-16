const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const params = {
    // 只获取状态为显示的地图点
    status: 1
  }

  // 排序：按创建时间降序
  const sort = {
    createdAt: -1,
    _id: -1
  }

  // 投影：只返回需要的字段，排除简介
  const projection = '_id title longitude latitude status zIndex'

  mappointUtils
    .find(params, sort, projection, { lean: true })
    .then(data => {
      res.send({
        list: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '地图标记点列表获取失败'
          }
        ]
      })
      userApiLog.error(`mappoint list get fail, ${logErrorToText(err)}`)
    })
}
