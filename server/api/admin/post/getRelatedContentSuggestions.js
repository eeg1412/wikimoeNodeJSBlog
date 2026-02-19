const bangumisUtils = require('../../../mongodb/utils/bangumis')
const gamesUtils = require('../../../mongodb/utils/games')
const moviesUtils = require('../../../mongodb/utils/movies')
const mappointsUtils = require('../../../mongodb/utils/mappoints')
const booksUtils = require('../../../mongodb/utils/books')
const tagsUtils = require('../../../mongodb/utils/tags')
const eventsUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { keywords, titles } = req.body
  const paramsCheck = {
    keywords,
    titles
  }
  const rule = [
    {
      key: 'keywords',
      label: '关键词数组',
      required: true,
      strict: true,
      strictType: 'object'
    },
    {
      key: 'titles',
      label: '标题数组',
      required: true,
      strict: true,
      strictType: 'object'
    }
  ]
  const errors = utils.checkForm(paramsCheck, rule)
  if (errors.length === 0 && !Array.isArray(keywords)) {
    errors.push({
      key: 'keywords',
      message: 'keywords 类型必须是 array'
    })
  }
  if (errors.length === 0 && !Array.isArray(titles)) {
    errors.push({
      key: 'titles',
      message: 'titles 类型必须是 array'
    })
  }
  if (errors.length > 0) {
    res.status(400).json({
      errors
    })
    return
  }

  try {
    const buildRegexArray = keywordList => {
      return keywordList.map(k => ({
        $regex: utils.escapeSpecialChars(k),
        $options: 'i'
      }))
    }

    const buildTitleQuery = titleKeywords => {
      if (titleKeywords.length === 0) {
        return { $expr: false }
      }
      return {
        $or: buildRegexArray(titleKeywords).map(r => ({ title: r })),
        status: { $in: [0, 1] }
      }
    }

    const buildKeywordQuery = keywordList => {
      if (keywordList.length === 0) {
        return { $expr: false }
      }
      return {
        $or: buildRegexArray(keywordList).map(r => ({ title: r })),
        status: { $in: [0, 1] }
      }
    }

    const buildTagTitleQuery = titleKeywords => {
      if (titleKeywords.length === 0) {
        return { $expr: false }
      }
      return {
        $or: buildRegexArray(titleKeywords).map(r => ({ tagname: r }))
      }
    }

    const buildTagKeywordQuery = keywordList => {
      if (keywordList.length === 0) {
        return { $expr: false }
      }
      return {
        $or: buildRegexArray(keywordList).map(r => ({ tagname: r }))
      }
    }

    // 构建 $facet 聚合管道
    const createFacetPipeline = (titleQuery, keywordQuery, projection) => {
      return [
        {
          $facet: {
            titleMatched: [
              { $match: titleQuery },
              { $sort: { _id: -1 } },
              { $limit: 20 },
              { $project: projection }
            ],
            keywordMatched: [
              { $match: keywordQuery },
              { $sort: { _id: -1 } },
              { $limit: 20 },
              { $project: projection }
            ]
          }
        }
      ]
    }

    // 定义字段投影
    const bangumiProjection = {
      _id: 1,
      title: 1,
      year: 1,
      season: 1,
      status: 1
    }
    const gameProjection = { _id: 1, title: 1, status: 1 }
    const movieProjection = {
      _id: 1,
      title: 1,
      year: 1,
      month: 1,
      day: 1,
      status: 1
    }
    const mappointProjection = { _id: 1, title: 1, status: 1 }
    const bookProjection = { _id: 1, title: 1, status: 1 }
    const tagProjection = { _id: 1, tagname: 1 }
    const eventProjection = { _id: 1, title: 1, status: 1, startTime: 1 }

    // 使用 Promise.all 并行执行 7 次查询（每个集合 1 次）
    const [
      bangumiResult,
      gameResult,
      movieResult,
      mappointResult,
      bookResult,
      tagResult,
      eventResult
    ] = await Promise.all([
      bangumisUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          bangumiProjection
        )
      ),
      gamesUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          gameProjection
        )
      ),
      moviesUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          movieProjection
        )
      ),
      mappointsUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          mappointProjection
        )
      ),
      booksUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          bookProjection
        )
      ),
      tagsUtils.aggregate(
        createFacetPipeline(
          buildTagTitleQuery(titles),
          buildTagKeywordQuery(keywords),
          tagProjection
        )
      ),
      eventsUtils.aggregate(
        createFacetPipeline(
          buildTitleQuery(titles),
          buildKeywordQuery(keywords),
          eventProjection
        )
      )
    ])

    // 提取聚合结果（aggregate 返回数组，取第一个元素）
    const bangumiData = bangumiResult[0] || {
      titleMatched: [],
      keywordMatched: []
    }
    const gameData = gameResult[0] || { titleMatched: [], keywordMatched: [] }
    const movieData = movieResult[0] || { titleMatched: [], keywordMatched: [] }
    const mappointData = mappointResult[0] || {
      titleMatched: [],
      keywordMatched: []
    }
    const bookData = bookResult[0] || { titleMatched: [], keywordMatched: [] }
    const tagData = tagResult[0] || { titleMatched: [], keywordMatched: [] }
    const eventData = eventResult[0] || { titleMatched: [], keywordMatched: [] }

    res.send({
      bangumi: bangumiData,
      game: gameData,
      movie: movieData,
      mappoint: mappointData,
      book: bookData,
      tag: tagData,
      event: eventData
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '关联内容建议获取失败'
        }
      ]
    })
    adminApiLog.error(
      `related content suggestions get fail, ${logErrorToText(err)}`
    )
  }
}
