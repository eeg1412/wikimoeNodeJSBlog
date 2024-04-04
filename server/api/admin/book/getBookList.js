const bookUtils = require('../../../mongodb/utils/books')
  const utils = require('../../../utils/utils')
  const log4js = require('log4js')
  const adminApiLog = log4js.getLogger('adminApi')
  
  module.exports = async function (req, res, next) {
    let { page, size, keyword } = req.query
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
    }
    // 如果keyword存在，就加入查询条件
    if (keyword) {
      keyword = utils.escapeSpecialChars(keyword)
      params.bookname = new RegExp(keyword, 'i')
    }
  
    const sort = {
      lastusetime: -1,
      _id: -1
    }
    bookUtils.findPage(params, sort, page, size).then((data) => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
  
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '书籍列表获取失败'
        }]
      })
      adminApiLog.error(`book list get fail, ${JSON.stringify(err)
    }`)
    })
  }
