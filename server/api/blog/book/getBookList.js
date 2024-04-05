const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, sortType, booktypeId } = req.query
  page = parseInt(page)
  let size = 20
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
    status: 1
  }

  const sort = {

  }
  if (sortType === 'rating') {
    sort.rating = -1
    sort._id = -1
  } else {
    sort.startTime = -1
    sort._id = -1
  }
  if (booktypeId && utils.isObjectId(booktypeId)) {
    params.booktype = booktypeId
  }

  bookUtils.findPage(params, sort, page, size, '_id cover endTime booktype label rating startTime status summary title urlList giveUp').then((data) => {
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
    userApiLog.error(`book list get fail, ${JSON.stringify(err)
      }`)
  })
}
