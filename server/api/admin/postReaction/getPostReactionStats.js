const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  try {
    const mongodb = global.$mongodDB
    const stats = await mongodb.db.command({ collStats: 'postreactions' })
    const size = stats.size
    const maxPostReactionsSize = process.env.MAX_HISTORYLOGS_SIZE
      ? Number(process.env.MAX_HISTORYLOGS_SIZE)
      : 1073741824
    const isExceedMaxSize = size > maxPostReactionsSize
    res.send({
      stats: {
        size,
        maxPostReactionsSize,
        isExceedMaxSize
      }
    })
  } catch (err) {
    res.send({
      stats: {
        size: 0,
        maxPostReactionsSize: process.env.MAX_HISTORYLOGS_SIZE
          ? Number(process.env.MAX_HISTORYLOGS_SIZE)
          : 1073741824,
        isExceedMaxSize: false
      }
    })
  }
}
