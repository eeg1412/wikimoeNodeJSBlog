const acgnSeriesUtils = require('../../../mongodb/utils/acgnSeries')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const mongoose = require('mongoose')
const bangumiModel = require('../../../mongodb/models/bangumis')
const movieModel = require('../../../mongodb/models/movies')
const bookModel = require('../../../mongodb/models/books')
const gameModel = require('../../../mongodb/models/games')

module.exports = async function (req, res, next) {
  const { id } = req.query
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{ message: 'id格式错误' }]
    })
    return
  }

  try {
    const seriesData = await acgnSeriesUtils.findOne({ _id: id })
    if (!seriesData) {
      res.status(400).json({
        errors: [{ message: '系列不存在' }]
      })
      return
    }

    const seriesId = new mongoose.Types.ObjectId(id)

    // 统计各类别公开显示的数量

    const [bangumiCount, movieCount, bookCount, gameCount] = await Promise.all([
      bangumiModel.countDocuments({ series: seriesId, status: 1 }),
      movieModel.countDocuments({ series: seriesId, status: 1 }),
      bookModel.countDocuments({ series: seriesId, status: 1 }),
      gameModel.countDocuments({ series: seriesId, status: 1 })
    ])

    res.send({
      data: {
        series: seriesData,
        counts: {
          bangumi: bangumiCount,
          movie: movieCount,
          book: bookCount,
          game: gameCount
        }
      }
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '系列详情获取失败' }]
    })
    userApiLog.error(`acgnSeries detail get fail, ${JSON.stringify(err)}`)
  }
}
