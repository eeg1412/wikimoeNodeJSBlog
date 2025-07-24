const movieUtils = require('../../../mongodb/utils/movies')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, sortType, keyword, year } = req.query
  page = parseInt(page)
  let size = 20
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
    status: 1
  }

  if (year) {
    year = parseInt(year)
    if (!utils.validateDate(year, 12, 31)) {
      res.status(400).json({
        errors: [
          {
            message: '日期格式不正确'
          }
        ]
      })
      return
    }
    params.year = year
  }

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
        label: { $in: regexArray }
      }
    ]
  }

  const rule = []
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  let sort = {
    year: -1,
    month: -1,
    day: -1,
    rating: -1,
    _id: -1
  }
  if (sortType === 'rating') {
    sort = {
      rating: -1,
      year: -1,
      month: -1,
      day: -1,
      _id: -1
    }
  }

  movieUtils
    .findPage(
      params,
      sort,
      page,
      size,
      '_id cover label rating status summary title year month day urlList postLinkOpen'
    )
    .then(data => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '电影列表获取失败'
          }
        ]
      })
      userApiLog.error(`movie list get fail, ${JSON.stringify(err)}`)
    })
}
