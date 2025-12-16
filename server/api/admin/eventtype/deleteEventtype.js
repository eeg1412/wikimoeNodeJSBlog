const eventtypeUtils = require('../../../mongodb/utils/eventtypes')
const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }
  // 查看对应活动数量
  const eventCount = await eventUtils.count({ eventtype: id })
  if (eventCount > 0) {
    res.status(400).json({
      errors: [
        {
          message: '该类型下有活动，不能删除'
        }
      ]
    })
    return
  }
  //  删除活动类型
  eventtypeUtils
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
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`eventtype delete fail, ${logErrorToText(err)}`)
    })
}
