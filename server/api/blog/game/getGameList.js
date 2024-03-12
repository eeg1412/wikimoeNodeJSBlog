const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, sortType, gamePlatformId } = req.query
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
  if (gamePlatformId && utils.isObjectId(gamePlatformId)) {
    params.gamePlatform = gamePlatformId
  }

  gameUtils.findPage(params, sort, page, size, '_id cover endTime gamePlatform label rating screenshotAlbum startTime status summary title urlList').then((data) => {
    // 返回格式list,total
    res.send({
      list: data.list,
      total: data.total
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '游戏列表获取失败'
      }]
    })
    userApiLog.error(`game list get fail, ${JSON.stringify(err)
      }`)
  })
}
