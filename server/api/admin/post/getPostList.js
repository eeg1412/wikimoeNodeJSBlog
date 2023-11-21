const chalk = require('chalk')
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
      errors: [{
        message: '参数错误'
      }]
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
    // 检索title和content
    params.$or = [
      {
        title: {
          $regex: keyword,
          $options: 'i'
        }
      },
      {
        content: {
          $regex: keyword,
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
  if (tags) {
    // tags是数组
    params.tags = {
      $in: tags
    }
  }

  // updatetime越新越靠前，_id越新越靠前
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
        break;
      // 2: 按照创建时间date降序
      case 'date_descending':
        postSorting = {
          date: -1
        }
        break;
      // 按照点击数views升序
      case 'views_ascending':
        postSorting = {
          views: 1
        }
        break;
      // 按照点击数views降序
      case 'views_descending':
        postSorting = {
          views: -1
        }
        break;
      // 按照评论数comnum升序
      case 'comnum_ascending':
        postSorting = {
          comnum: 1
        }
        break;
      // 按照评论数comnum降序
      case 'comnum_descending':
        postSorting = {
          comnum: -1
        }
        break;
      // 按照更新时间updatetime升序
      case 'updatetime_ascending':
        postSorting = {
          updatetime: 1
        }
        break;
      // 按照更新时间updatetime降序
      case 'updatetime_descending':
        postSorting = {
          updatetime: -1
        }
        break;

      default:
        break;
    }
  }
  const filter = '-excerpt'
  postUtils.findPage(params, filter, postSorting, page, size).then((data) => {

    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '文章列表获取失败'
      }]
    })
    adminApiLog.error(`post list get fail, ${JSON.stringify(err)}`)
  })
}
