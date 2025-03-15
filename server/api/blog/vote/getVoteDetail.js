const votelogUtils = require('../../../mongodb/utils/votelogs')
const voteUtils = require('../../../mongodb/utils/votes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  const uuid = req.headers['wmb-request-id']

  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }

  // 判断id是否符合格式
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }


  const voteParams = {
    _id: id,
    status: 1,
  }
  const voteData = await voteUtils.findOne(voteParams, undefined, { lean: true })
  if (!voteData) {
    res.status(400).json({
      errors: [{
        message: '投票不存在'
      }]
    })
    return
  }
  // 查询该id是否在log中有过投票，通过uuid或ip
  const ip = utils.getUserIp(req)
  const logParams = {
    vote: id,
    $or: [
      { uuid },
      { ip },
    ],
  }
  const logData = await votelogUtils.findOne(logParams, '_id options uuid ip', { lean: true })
  const showResultAfter = voteData.showResultAfter
  const endTime = voteData.endTime
  // 是否过期
  const now = new Date()
  const isExpired = endTime ? endTime < now : false

  let userOptions = []
  let bothIP = false
  let bothUUID = false
  if (showResultAfter && !isExpired) {
    if (logData <= 0) {
      // 需要将votes和options.votes数隐藏
      voteData.votes = null
      voteData.options.forEach(option => {
        option.votes = null
      })
    } else {
      const logIP = logData.ip
      const logUUID = logData.uuid
      if (logIP === ip) {
        bothIP = true
      }
      if (logUUID === uuid) {
        bothUUID = true
        userOptions = logData.options || []
      }

    }
  }
  res.send({
    data: voteData,
    // 是否投过票
    voted: logData ? true : false,
    options: userOptions,
    isExpired,
    bothIP,
    bothUUID
  })
}
