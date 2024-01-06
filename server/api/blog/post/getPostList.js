
const postUtils = require('../../../mongodb/utils/posts')
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const moment = require('moment-timezone');

module.exports = async function (req, res, next) {
  let { page, keyword, type, sorttype, sortid, tags, pageType, year,
    month, } = req.query
  page = parseInt(page)
  const size = global.$globalConfig?.siteSettings?.sitePageSize || 1
  // 判断page和size是否为数字
  if (!utils.isNumber(page)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
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
    // 如果keyword超过20个字符，就截取前20个字符
    if (keyword.length > 20) {
      keyword = keyword.substring(0, 20)
    }
    // 检索title和excerpt
    params.$or = [
      {
        title: {
          $regex: keyword,
          $options: 'i'
        }
      },
      {
        excerpt: {
          $regex: keyword,
          $options: 'i'
        }
      }
    ]
  }
  // 如果type存在，就加入查询条件
  if (type) {
    params.type =
    {
      $in: type
    }
  }

  // 如果sort存在，就加入查询条件
  if (sortid) {
    const sortList = global.$cacheData?.sortList || []
    function findInSortList (sortList, sortid, isObjectId) {
      for (let item of sortList) {
        if ((isObjectId && item._id.toString() === sortid) || (!isObjectId && item.alias.toLowerCase() === sortid.toLowerCase())) {
          return item;
        }

        if (item.children) {
          let result = findInSortList(item.children, sortid, isObjectId);
          if (result) {
            return result;
          }
        }
      }

      return null;
    }


    let isObjectId = utils.isObjectId(sortid);
    let sort = findInSortList(sortList, sortid, isObjectId);
    let childrenIds = [];

    if (sort && sort.children) {
      childrenIds = sort.children.map(child => child._id);
    }
    if (!sort) {
      res.status(404).json({
        errors: [{
          message: '分类不存在'
        }]
      })
      return
    }
    params.sort = {
      $in: [sort._id, ...childrenIds]
    }
  }
  // 如果tags存在，就加入查询条件
  if (tags) {
    // tags是数组
    params.tags = {
      $in: tags
    }
  }

  // 如果存在年和月
  if (year && month) {
    // 年月需要转成数字
    year = parseInt(year)
    month = parseInt(month)
    // 判断year和month是否是NaN
    if (isNaN(year) || isNaN(month)) {
      res.status(400).json({
        errors: [{
          message: '参数错误'
        }]
      })
      return
    }
    month = month - 1
    // 判断month是否在0-11之间
    if (month < 0 || month > 11) {
      res.status(400).json({
        errors: [{
          message: '月份错误'
        }]
      })
      return
    }
    // 时区
    const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
    // 根据年月和时区查询整月的开始时间和结束时间
    const startDate = moment.tz([year, month], siteTimeZone).startOf('month').toDate();
    const endDate = moment.tz([year, month], siteTimeZone).add(1, 'month').startOf('month').toDate();
    // 查询条件
    params.date = {
      $gte: startDate,
      $lt: endDate
    }
  }


  // date越新越靠前，_id越新越靠前
  let postSorting = {

  }
  switch (pageType) {
    case 'post':
      // 将top放到第一位,top是布尔
      postSorting['top'] = -1
      break;
    case 'sort':
      // 将sort放到第一位
      postSorting['sortop'] = -1
      break;

    default:
      break;
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
      // 按照更新时间updatedAt升序
      case 'updatedAt_ascending':
        postSorting = {
          updatedAt: 1
        }
        break;
      // 按照更新时间updatedAt降序
      case 'updatedAt_descending':
        postSorting = {
          updatedAt: -1
        }
        break;

      default:
        break;
    }
  }
  const filter = '-content'
  postUtils.findPage(params, postSorting, page, size, filter).then((data) => {

    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total,
      size: size,
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '文章列表获取失败'
      }]
    })
    userApiLog.error(`post list get fail, ${JSON.stringify(err)}`)
  })
}
