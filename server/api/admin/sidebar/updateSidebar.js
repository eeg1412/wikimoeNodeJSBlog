const sidebarUtils = require('../../../mongodb/utils/sidebars')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { _id, title, content, count, status } = req.body
  if (!_id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }

  // 校验格式
  const params = {
    title: title || '',
    content: content || '',
    count: count || 1,
    status: status || 0
  }
  // updateOne
  sidebarUtils
    .updateOne({ _id: _id }, params)
    .then(data => {
      // 判断是否更新成功
      if (data.modifiedCount === 0) {
        // 记录
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      // 记录
      adminApiLog.info(`sidebar update success`)
      // 返回
      res.send({
        data: data
      })
      cacheDataUtils.getSidebarList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      // 记录
      adminApiLog.error(`sidebar update fail, ${logErrorToText(err)}`)
      // 报错
      res.status(400).json({
        errors: [
          {
            message: '更新失败'
          }
        ]
      })
    })
}
