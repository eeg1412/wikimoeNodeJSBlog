const utils = require('../../../utils/utils')
const bangumiUtils = require('../../../mongodb/utils/bangumis')
const movieUtils = require('../../../mongodb/utils/movies')
const bookUtils = require('../../../mongodb/utils/books')
const gameUtils = require('../../../mongodb/utils/games')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

const TYPE_CONFIG = {
  bangumi: {
    utils: bangumiUtils,
    projection:
      '_id cover label rating season status summary title year giveUp urlList postLinkOpen series'
  },
  movie: {
    utils: movieUtils,
    projection:
      '_id cover label rating status summary title year month day urlList postLinkOpen series'
  },
  book: {
    utils: bookUtils,
    projection:
      '_id cover label rating status summary title urlList postLinkOpen startTime endTime giveUp booktype series'
  },
  game: {
    utils: gameUtils,
    projection:
      '_id cover label rating status summary title urlList postLinkOpen startTime endTime giveUp gamePlatform screenshotAlbum series'
  }
}

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

  if (!TYPE_CONFIG[type]) {
    res.status(400).json({
      errors: [{ message: '类别参数错误' }]
    })
    return
  }

  try {
    const { utils: utilsModule, projection } = TYPE_CONFIG[type]

    const params = { series: seriesId, status: 1 }
    const sort = { _id: -1 }

    const result = await utilsModule.findPage(
      params,
      sort,
      page,
      size,
      projection
    )

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
