const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id, type } = req.body

  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  // type: startTime | endTime
  if (type !== 'startTime' && type !== 'endTime') {
    res.status(400).json({
      errors: [{ message: 'type参数错误' }]
    })
    return
  }

  const now = new Date()
  const updateData = {}
  updateData[type] = now

  try {
    const data = await gameUtils.updateOne({ _id: id }, { $set: updateData })
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{ message: '更新失败' }]
      })
      return
    }
    const label = type === 'startTime' ? '开始游玩' : '结束游玩'
    res.send({
      data: { message: `${label}时间设置成功` }
    })
    adminApiLog.info(`game updateTime success, id: ${id}, type: ${type}`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '时间设置失败' }]
    })
    adminApiLog.error(`game updateTime fail, ${logErrorToText(err)}`)
  }
}
