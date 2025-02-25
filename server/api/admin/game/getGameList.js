const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, gamePlatform, status, playStatus } = req.query
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
  if (playStatus) {
    const playStatusList = [99, 1, 2, 3]
    const playStatusNumber = Number(playStatus)
    // 如果status在statusList中，就加入查询条件
    if (playStatusList.includes(playStatusNumber)) {
      switch (playStatusNumber) {
        case 99:
          params.giveUp = true
          break;
        case 1:
          // 未开始：startTime和endTime都为空
          params.giveUp = false
          params.startTime = { $eq: null }
          params.endTime = { $eq: null }
          break;
        case 2:
          // 进行中：startTime有值，endTime为空
          params.giveUp = false
          params.startTime = { $ne: null }
          params.endTime = { $eq: null }
          break;
        case 3:
          // 已完成：startTime和endTime都有值
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
  // 如果gamePlatform存在，就加入查询条件
  if (gamePlatform) {
    // gamePlatform 是数组
    params.gamePlatform = { $in: gamePlatform }
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = status
  }

  const sort = {
    _id: -1
  }
  gameUtils.findPage(params, sort, page, size).then((data) => {
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
    adminApiLog.error(`game list get fail, ${JSON.stringify(err)
      }`)
  })
}
