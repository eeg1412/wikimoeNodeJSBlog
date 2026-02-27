const movieUtils = require('../../../mongodb/utils/movies')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.body

  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  try {
    const data = await movieUtils.updateOne(
      { _id: id },
      { $set: { year, month, day } }
    )
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{ message: '更新失败' }]
      })
      return
    }
    res.send({
      data: { message: '观看日期设置成功' }
    })
    adminApiLog.info(`movie updateWatchDate success, id: ${id}`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '观看日期设置失败' }]
    })
    adminApiLog.error(`movie updateWatchDate fail, ${logErrorToText(err)}`)
  }
}
