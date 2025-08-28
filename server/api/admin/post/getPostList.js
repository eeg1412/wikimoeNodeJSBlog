const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, type, sorttype, status, sort, tags } = req.query
  page = parseInt(page)
  size = parseInt(size)
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
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
    // 默认status为0或1
    status: {
      $in: [0, 1]
    }
  }
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    const escapedKeyword = utils.escapeSpecialChars(keyword)
    // 检索title和content
    params.$or = [
      {
        title: {
          $regex: escapedKeyword,
          $options: 'i'
        }
      },
      {
        content: {
          $regex: escapedKeyword,
          $options: 'i'
        }
      },
      {
        excerpt: {
          $regex: escapedKeyword,
          $options: 'i'
        }
      }
    ]
  }
  // 如果type存在，就加入查询条件
  if (type) {
    params.type = type
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = status
  }
  // 如果sort存在，就加入查询条件
  if (sort) {
    params.sort = sort
  }
  // 如果tags存在，就加入查询条件
  if (tags && tags?.length > 0) {
    // 校验tags 是否含有空内容
    for (let i = 0; i < tags.length; i++) {
      if (!tags[i]) {
        res.status(400).json({
          errors: [
            {
              message: 'tags格式错误'
            }
          ]
        })
        return
      }
    }
    // tags是数组
    params.tags = {
      $in: tags
    }
  }

  // date越新越靠前，_id越新越靠前
  let postSorting = {
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
      // 按照分享数shares升序
      case 'shares_ascending':
        postSorting = {
          shares: 1
        }
        break
      // 按照分享数shares降序
      case 'shares_descending':
        postSorting = {
          shares: -1
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
  const filter = '-content'
  postUtils
    .findPage(params, postSorting, page, size, filter, { isAdmin: true })
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
            message: '文章列表获取失败'
          }
        ]
      })
      adminApiLog.error(`post list get fail, ${logErrorToText(err)}`)
    })
}
