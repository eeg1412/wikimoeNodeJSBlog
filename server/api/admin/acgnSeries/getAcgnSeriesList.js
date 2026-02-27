const acgnSeriesUtils = require('../../../mongodb/utils/acgnSeries')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword } = req.query
  page = Number(page)
  size = Number(size)

  const queryCheck = { page, size, keyword }
  const queryRule = [
    {
      key: 'page',
      label: '页数',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: { min: 1 },
      required: true
    },
    {
      key: 'size',
      label: '每页数量',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: { min: 1 },
      required: true
    },
    {
      key: 'keyword',
      label: '关键词',
      strict: true,
      strictType: 'string',
      required: false
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({ errors: queryErrors })
    return
  }

  const params = {}
  if (keyword) {
    keyword = String(keyword).trim()
    const keywordArray = keyword.split(' ')
    const regexArray = keywordArray.map(kw => {
      const escapedKeyword = utils.escapeSpecialChars(kw)
      return new RegExp(escapedKeyword, 'i')
    })
    params.$or = [{ name: { $in: regexArray } }, { alias: { $in: regexArray } }]
  }

  const sort = { _id: -1 }

  // 使用聚合查询，统计关联的 番剧、电影、书籍、游戏 数量
  const pipeline = [
    { $match: params },
    {
      $lookup: {
        from: 'bangumis',
        localField: '_id',
        foreignField: 'series',
        as: 'bangumiItems'
      }
    },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: 'series',
        as: 'movieItems'
      }
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: 'series',
        as: 'bookItems'
      }
    },
    {
      $lookup: {
        from: 'games',
        localField: '_id',
        foreignField: 'series',
        as: 'gameItems'
      }
    },
    {
      $addFields: {
        bangumiCount: { $size: '$bangumiItems' },
        movieCount: { $size: '$movieItems' },
        bookCount: { $size: '$bookItems' },
        gameCount: { $size: '$gameItems' }
      }
    },
    {
      $project: {
        bangumiItems: 0,
        movieItems: 0,
        bookItems: 0,
        gameItems: 0
      }
    },
    { $sort: sort },
    { $skip: (page - 1) * size },
    { $limit: size }
  ]

  const aggregatePipeline = [
    {
      $facet: {
        list: pipeline,
        total: [{ $match: params }, { $count: 'count' }]
      }
    }
  ]

  acgnSeriesUtils
    .aggregate(aggregatePipeline)
    .then(result => {
      const data = {
        list: result[0].list,
        total: result[0].total[0]?.count || 0
      }
      res.send(data)
    })
    .catch(err => {
      res.status(400).json({
        errors: [{ message: '系列列表获取失败' }]
      })
      adminApiLog.error(`acgnSeries list get fail, ${logErrorToText(err)}`)
    })
}
