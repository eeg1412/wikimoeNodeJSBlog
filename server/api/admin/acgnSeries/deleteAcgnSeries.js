const acgnSeriesUtils = require('../../../mongodb/utils/acgnSeries')
const bangumiUtils = require('../../../mongodb/utils/bangumis')
const movieUtils = require('../../../mongodb/utils/movies')
const bookUtils = require('../../../mongodb/utils/books')
const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  const oldData = await acgnSeriesUtils.findOne({ _id: id })
  if (!oldData) {
    res.status(400).json({
      errors: [{ message: '该数据不存在' }]
    })
    return
  }

  try {
    await acgnSeriesUtils.deleteOne({ _id: id })
    // 并发清除关联的 series 字段
    await Promise.all([
      bangumiUtils
        .updateMany({ series: id }, { $set: { series: null } })
        .catch(() => {}),
      movieUtils
        .updateMany({ series: id }, { $set: { series: null } })
        .catch(() => {}),
      bookUtils
        .updateMany({ series: id }, { $set: { series: null } })
        .catch(() => {}),
      gameUtils
        .updateMany({ series: id }, { $set: { series: null } })
        .catch(() => {})
    ])

    res.send({
      data: { message: '删除成功' }
    })
    adminApiLog.info(`acgnSeries delete success`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '删除失败' }]
    })
    adminApiLog.error(`acgnSeries delete fail, ${logErrorToText(err)}`)
  }
}
