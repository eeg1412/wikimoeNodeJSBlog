const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, sortType, gamePlatformId, status, keyword } = req.query
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

  if (status) {
    const statusList = [99, 1, 2, 3]
    const statusNumber = Number(status)
    // 如果status在statusList中，就加入查询条件
    if (statusList.includes(statusNumber)) {
      switch (statusNumber) {
        case 99:
          params.giveUp = true
          break;
        case 1:
          params.giveUp = false
          params.startTime = null
          params.endTime = null
          break;
        case 2:
          // 查询有开始时间没结束时间
          params.giveUp = false
          params.startTime = { $ne: null }
          params.endTime = null
          break;
        case 3:
          // 查询有开始和结束时间
          params.giveUp = false
          params.startTime = { $ne: null }
          params.endTime = { $ne: null }
          break;

        default:
          break;
      }

    }
  }

  if (keyword) {
    keyword = String(keyword)
    // keyword去掉前后空格
    keyword = keyword?.trim()
    // 如果keyword超过20个字符，就截取前20个字符
    if (keyword.length > 20) {
      keyword = Array.from(keyword).slice(0, 20).join('');
    }
    const keywordArray = keyword.split(' ');
    const regexArray = keywordArray.map(keyword => {
      const escapedKeyword = utils.escapeSpecialChars(keyword);
      const regex = new RegExp(escapedKeyword, 'i');
      return regex;
    });
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

  gameUtils.findPage(params, sort, page, size, '_id cover endTime gamePlatform label rating screenshotAlbum startTime status summary title urlList giveUp').then((data) => {
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
