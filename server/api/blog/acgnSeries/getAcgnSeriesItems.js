const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { seriesId, type, page } = req.query
  page = parseInt(page)
  const size = 5

  if (!utils.isObjectId(seriesId)) {
    res.status(400).json({
      errors: [{ message: 'seriesId格式错误' }]
    })
    return
  }

  if (!utils.isNumber(page) || page < 1) {
    res.status(400).json({
      errors: [{ message: '参数错误' }]
    })
    return
  }

  const validTypes = ['bangumi', 'movie', 'book', 'game']
  if (!validTypes.includes(type)) {
    res.status(400).json({
      errors: [{ message: '类别参数错误' }]
    })
    return
  }

  try {
    let utilsModule
    let projection
    let populateFields = []
    switch (type) {
      case 'bangumi':
        utilsModule = require('../../../mongodb/utils/bangumis')
        projection =
          '_id cover label rating season status summary title year giveUp urlList postLinkOpen series'
        break
      case 'movie':
        utilsModule = require('../../../mongodb/utils/movies')
        projection =
          '_id cover label rating status summary title year month day urlList postLinkOpen series'
        break
      case 'book':
        utilsModule = require('../../../mongodb/utils/books')
        projection =
          '_id cover label rating status summary title urlList postLinkOpen startTime endTime giveUp booktype series'
        populateFields = [{ path: 'booktype', select: '_id name color' }]
        break
      case 'game':
        utilsModule = require('../../../mongodb/utils/games')
        projection =
          '_id cover label rating status summary title urlList postLinkOpen startTime endTime giveUp gamePlatform screenshotAlbum series'
        populateFields = [
          { path: 'gamePlatform', select: '_id name color' },
          { path: 'screenshotAlbum', select: '_id name' }
        ]
        break
    }

    const params = { series: seriesId, status: 1 }
    const sort = { _id: -1 }

    const model = utilsModule
    const result = await model.findPage(params, sort, page, size, projection)

    // 如果有需要 populate 的字段，手动 populate
    if (populateFields.length > 0) {
      const modelRef = require(
        `../../../mongodb/models/${type === 'book' ? 'books' : 'games'}`
      )
      const populatedList = await modelRef.populate(result.list, populateFields)
      result.list = populatedList
    }

    res.send({
      data: result
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '系列作品列表获取失败' }]
    })
    userApiLog.error(`acgnSeries items get fail, ${JSON.stringify(err)}`)
  }
}
