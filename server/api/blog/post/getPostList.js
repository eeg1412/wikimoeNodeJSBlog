const postUtils = require('../../../mongodb/utils/posts')
const sortUtils = require('../../../mongodb/utils/sorts')
const tagsUtils = require('../../../mongodb/utils/tags')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const moment = require('moment-timezone')

module.exports = async function (req, res, next) {
  let {
    page,
    keyword,
    type,
    sorttype,
    sortid,
    tags,
    mappointid,
    bangumiId,
    movieId,
    bookId,
    gameId,
    pageType,
    year,
    month
  } = req.query
  page = parseInt(page)
  const size = global.$globalConfig?.siteSettings?.sitePageSize || 1
  // 判断page和size是否为数字
  if (!utils.isNumber(page)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }
  const params = {
    // 默认status为1
    status: 1,
    // 默认type为blog和tweet
    type: {
      $in: [1, 2]
    }
  }
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = String(keyword)
    // keyword去掉前后空格
    keyword = keyword?.trim()
    // 如果keyword超过20个字符，就截取前20个字符
    if (keyword.length > 20) {
      keyword = Array.from(keyword).slice(0, 20).join('')
    }
    const keywordArray = keyword.split(' ')
    const regexArray = keywordArray.map(keyword => {
      const escapedKeyword = utils.escapeSpecialChars(keyword)
      const regex = new RegExp(escapedKeyword, 'i')
      return regex
    })
    // 检索title和excerpt
    params.$or = [
      {
        title: { $in: regexArray }
      },
      {
        excerpt: { $in: regexArray }
      }
    ]
    // 检索tags
    const tags = await tagsUtils
      .findLimit({ tagname: { $in: regexArray } }, undefined, 100)
      .catch(err => {
        return []
      })
    if (tags.length > 0) {
      params.$or.push({
        tags: {
          $in: tags.map(tag => tag._id)
        }
      })
    }
  }
  // 如果type存在，就加入查询条件
  if (Array.isArray(type)) {
    // 校验type是否是数组，且只能是1和2
    if (type.some(item => ![1, 2].includes(parseInt(item)))) {
      res.status(400).json({
        errors: [
          {
            message: 'type参数错误'
          }
        ]
      })
      return
    }
    params.type = {
      $in: type
    }
  } else if (type) {
    // 校验type是否是1和2
    if (![1, 2].includes(parseInt(type))) {
      res.status(400).json({
        errors: [
          {
            message: 'type参数错误'
          }
        ]
      })
      return
    }
    params.type = parseInt(type)
  }

  // 如果sort存在，就加入查询条件
  if (sortid) {
    const sortList = global.$cacheData?.sortList || []
    function findInSortList(sortList, sortid, isObjectId) {
      for (let item of sortList) {
        if (
          (isObjectId && item._id.toString() === sortid) ||
          (!isObjectId && item.alias.toLowerCase() === sortid.toLowerCase())
        ) {
          return item
        }

        if (item.children) {
          let result = findInSortList(item.children, sortid, isObjectId)
          if (result) {
            return result
          }
        }
      }

      return null
    }

    let isObjectId = utils.isObjectId(sortid)
    let sort = findInSortList(sortList, sortid, isObjectId)
    let childrenIds = []

    if (sort && sort.children) {
      childrenIds = sort.children.map(child => child._id)
    }
    if (!sort) {
      res.status(404).json({
        errors: [
          {
            message: '分类不存在'
          }
        ]
      })
      return
    }
    params.sort = {
      $in: [sort._id, ...childrenIds]
    }
  }
  // 如果tags存在，就加入查询条件
  if (tags && tags.length > 0) {
    // tags是数组,需要校验是否为数组且每个元素都是ObjectId
    if (!Array.isArray(tags)) {
      res.status(400).json({
        errors: [
          {
            message: 'tags参数错误'
          }
        ]
      })
      return
    }
    if (tags.some(tag => !utils.isObjectId(tag))) {
      res.status(400).json({
        errors: [
          {
            message: 'tags参数错误'
          }
        ]
      })
      return
    }
    params.tags = {
      $in: tags
    }
  }
  // 如果mappointid存在，就加入查询条件
  if (mappointid) {
    // 校验mappointid是否为ObjectId
    if (!utils.isObjectId(mappointid)) {
      res.status(400).json({
        errors: [
          {
            message: 'mappointid参数错误'
          }
        ]
      })
      return
    }
    params.mappointList = {
      $in: [mappointid]
    }
  }

  // 如果bangumiId存在，就加入查询条件
  if (bangumiId) {
    // 校验bangumiId是否为ObjectId
    if (!utils.isObjectId(bangumiId)) {
      res.status(400).json({
        errors: [
          {
            message: 'bangumiId参数错误'
          }
        ]
      })
      return
    }
    // 注意：如果同时存在关键词搜索和ID检索，会合并到同一个$or条件中
    // 这意味着只要满足关键词搜索OR包含指定ID的任一条件即可
    params.$or = params.$or || []
    params.$or.push(
      { contentBangumiList: { $in: [bangumiId] } },
      { bangumiList: { $in: [bangumiId] } }
    )
  }

  // 如果movieId存在，就加入查询条件
  if (movieId) {
    // 校验movieId是否为ObjectId
    if (!utils.isObjectId(movieId)) {
      res.status(400).json({
        errors: [
          {
            message: 'movieId参数错误'
          }
        ]
      })
      return
    }
    params.$or = params.$or || []
    params.$or.push(
      { contentMovieList: { $in: [movieId] } },
      { movieList: { $in: [movieId] } }
    )
  }

  // 如果bookId存在，就加入查询条件
  if (bookId) {
    // 校验bookId是否为ObjectId
    if (!utils.isObjectId(bookId)) {
      res.status(400).json({
        errors: [
          {
            message: 'bookId参数错误'
          }
        ]
      })
      return
    }
    params.$or = params.$or || []
    params.$or.push(
      { contentBookList: { $in: [bookId] } },
      { bookList: { $in: [bookId] } }
    )
  }

  // 如果gameId存在，就加入查询条件
  if (gameId) {
    // 校验gameId是否为ObjectId
    if (!utils.isObjectId(gameId)) {
      res.status(400).json({
        errors: [
          {
            message: 'gameId参数错误'
          }
        ]
      })
      return
    }
    params.$or = params.$or || []
    params.$or.push(
      { contentGameList: { $in: [gameId] } },
      { gameList: { $in: [gameId] } }
    )
  }

  // 如果存在年和月
  if (year && month) {
    // 年月需要转成数字
    year = parseInt(year)
    month = parseInt(month)
    // 判断year和month是否是NaN
    if (isNaN(year) || isNaN(month)) {
      res.status(400).json({
        errors: [
          {
            message: '参数错误'
          }
        ]
      })
      return
    }
    month = month - 1
    // 判断month是否在0-11之间
    if (month < 0 || month > 11) {
      res.status(400).json({
        errors: [
          {
            message: '月份错误'
          }
        ]
      })
      return
    }
    // 时区
    const siteTimeZone =
      global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
    // 根据年月和时区查询整月的开始时间和结束时间
    const startDate = moment
      .tz([year, month], siteTimeZone)
      .startOf('month')
      .toDate()
    const endDate = moment
      .tz([year, month], siteTimeZone)
      .add(1, 'month')
      .startOf('month')
      .toDate()
    // 查询条件
    params.date = {
      $gte: startDate,
      $lt: endDate
    }
  }

  // date越新越靠前，_id越新越靠前
  let postSorting = {}
  switch (pageType) {
    case 'post':
      // 将top放到第一位,top是布尔
      postSorting['top'] = -1
      break
    case 'sort':
      // 将sort放到第一位
      postSorting['sortop'] = -1
      break

    default:
      break
  }
  postSorting = {
    ...postSorting,
    date: -1,
    _id: -1
  }

  if (sorttype) {
    switch (sorttype) {
      // 1: 按照创建时间date升序
      case 'date_ascending':
        postSorting = {
          date: 1
        }
        break
      // 2: 按照创建时间date降序
      case 'date_descending':
        postSorting = {
          date: -1
        }
        break
      // 按照点击数views升序
      case 'views_ascending':
        postSorting = {
          views: 1
        }
        break
      // 按照点击数views降序
      case 'views_descending':
        postSorting = {
          views: -1
        }
        break
      // 按照评论数comnum升序
      case 'comnum_ascending':
        postSorting = {
          comnum: 1
        }
        break
      // 按照评论数comnum降序
      case 'comnum_descending':
        postSorting = {
          comnum: -1
        }
        break
      // 按照点赞数likes升序
      case 'likes_ascending':
        postSorting = {
          likes: 1
        }
        break
      // 按照点赞数likes降序
      case 'likes_descending':
        postSorting = {
          likes: -1
        }
        break
      // 按照更新时间updatedAt升序
      case 'updatedAt_ascending':
        postSorting = {
          updatedAt: 1
        }
        break
      // 按照更新时间updatedAt降序
      case 'updatedAt_descending':
        postSorting = {
          updatedAt: -1
        }
        break

      default:
        break
    }
  }
  const filter =
    '-voteList -content -bangumiList -movieList -bookList -eventList -gameList -postList -seriesSortList -code -editorVersion'
  postUtils
    .findPage(params, postSorting, page, size, filter, {
      voteFliter:
        '_id endTime maxSelect showResultAfter title options.title options._id'
    })
    .then(data => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total,
        size: size
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '文章列表获取失败'
          }
        ]
      })
      userApiLog.error(`post list get fail, ${logErrorToText(err)}`)
    })
}
