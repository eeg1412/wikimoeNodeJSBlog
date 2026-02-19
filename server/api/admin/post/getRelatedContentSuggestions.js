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
  const { keywords } = req.body
  const paramsCheck = {
    keywords
  }
  const rule = [
    {
      key: 'keywords',
      label: '关键词数组',
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
  if (errors.length > 0) {
    res.status(400).json({
      errors
    })
    return
  }

  try {
    if (keywords.length === 0) {
      res.send({
        bangumi: [],
        game: [],
        movie: [],
        mappoint: [],
        book: [],
        tag: [],
        event: []
      })
      return
    }

    // 构建正则表达式
    const regexKeywords = keywords.map(k => ({
      $regex: utils.escapeSpecialChars(k),
      $options: 'i'
    }))

    const queryForTitle = {
      $or: regexKeywords.map(r => ({ title: r })),
      status: { $in: [0, 1] }
    }
    const queryForTag = {
      $or: regexKeywords.map(r => ({ tagname: r }))
    }

    // 针对每个模型进行查询，使用 findPage 在数据库层面限制结果数量
    const [
      bangumiData,
      gameData,
      movieData,
      mappointData,
      bookData,
      tagData,
      eventData
    ] = await Promise.all([
      bangumisUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title year season status'
      ),
      gamesUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title status'
      ),
      moviesUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title year month day status'
      ),
      mappointsUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title status'
      ),
      booksUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title status'
      ),
      tagsUtils.findPage(queryForTag, { _id: -1 }, 1, 50, '_id tagname'),
      eventsUtils.findPage(
        queryForTitle,
        { _id: -1 },
        1,
        50,
        '_id title status startTime'
      )
    ])

    res.send({
      bangumi: bangumiData.list,
      game: gameData.list,
      movie: movieData.list,
      mappoint: mappointData.list,
      book: bookData.list,
      tag: tagData.list,
      event: eventData.list
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
