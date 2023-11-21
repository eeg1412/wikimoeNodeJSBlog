const chalk = require('chalk')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, type, sorttype, status } = req.query
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
    params.name = new RegExp(keyword, 'i')
  }
  // 如果type存在，就加入查询条件
  if (type) {
    params.type = type
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = status
  }

  // updatetime越新越靠前，_id越新越靠前
  let sort = {
    updatetime: -1,
    _id: -1
  }
  if (sorttype) {
    switch (sorttype) {
      // 1: 按照创建时间date升序
      case '1':
        sort = {
          date: 1
        }
        break;
      // 2: 按照创建时间date降序
      case '2':
        sort = {
          date: -1
        }
        break;
      // 按照点击数views升序
      case '3':
        sort = {
          views: 1
        }
        break;
      // 按照点击数views降序
      case '4':
        sort = {
          views: -1
        }
        break;
      // 按照评论数comnum升序
      case '5':
        sort = {
          comnum: 1
        }
        break;
      // 按照评论数comnum降序
      case '6':
        sort = {
          comnum: -1
        }
        break;

      default:
        break;
    }
  }
  const filter = '-excerpt'
  postUtils.findPage(params, filter, sort, page, size).then((data) => {
    // 将data转换成json
    data = JSON.parse(JSON.stringify(data))
    // 遍历data.list
    data.list.forEach((item) => {
      const type = item.type
      if (type === 2) {
        // tweet的处理
        // title 根据content，裁切前20个字符，后面加上...
        item.title = item.content || ''
        if (item.content.length > 20) {
          item.title = item.content.slice(0, 20) + '...'
        }
      } else {
        // 清空content
        item.content = ''
      }
    })
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
