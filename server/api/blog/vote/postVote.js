const votelogUtils = require('../../../mongodb/utils/votelogs')
const voteUtils = require('../../../mongodb/utils/votes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const uuid = req.headers['wmb-request-id']
  const ip = utils.getUserIp(req)
  const voteId = req.body.voteId
  const optionIdList = req.body.optionIdList
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  // 判断voteId是否符合格式
  if (!utils.isObjectId(voteId)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  // 判断optionIdList是否是数组
  if (!Array.isArray(optionIdList)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  // 判断optionIdList是否大于0
  if (optionIdList.length <= 0) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  // 遍历optionIdList，判断optionId是否符合格式
  for (let optionId of optionIdList) {
    if (!utils.isObjectId(optionId)) {
      res.status(400).json({
        errors: [{
          message: '参数错误'
        }]
      })
      return
    }
  }
  utils.executeInLock(`blogVote-${voteId}`, async () => {
    const { isExceedMaxSize } = await utils.getVoteLogsSize()
    if (isExceedMaxSize) {
      res.status(400).json({ errors: [{ message: '投票失败，请稍后再试' }] })
      throw new Error('votelogs超出最大存储容量')
    }
    // 查询投票是否存在
    const voteParams = {
      _id: voteId,
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
    // 查询是否过期
    const endTime = voteData.endTime
    if (endTime && endTime < new Date()) {
      res.status(400).json({
        errors: [{
          message: '投票已过期'
        }]
      })
      return
    }
    // 查询optionIdList是否都存在
    const options = voteData.options
    // 将 options 中的 ID 转换为字符串集合以便高效比较
    const optionIds = new Set(options.map(opt => opt._id.toString()));

    // 检查 optionIdList 中的每个 ID 是否都存在于 optionIds 中
    const allOptionsValid = optionIdList.every(id => optionIds.has(id.toString()));
    if (!allOptionsValid) {
      res.status(400).json({
        errors: [{
          message: '参数错误'
        }]
      })
      return
    }
    // 查询该id是否在log中有过投票，通过uuid或ip
    const logParams = {
      vote: voteId,
      $or: [
        { uuid },
        { ip },
      ],
    }
    const logData = await votelogUtils.countDocuments(logParams)
    if (logData > 0) {
      res.status(400).json({
        errors: [{
          message: '已经投过票'
        }]
      })
      return
    }
    // 保存投票记录
    const voteRes = await voteUtils.updateOneByVote({ _id: voteId }, {
      $inc: {
        votes: optionIdList.length,  // 增加票数
        "options.$[elem].votes": 1  // 增加符合条件的每个选项票数
      },
    }, {
      arrayFilters: [
        { "elem._id": { $in: optionIdList } }
      ]
    })
    if (voteRes.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    // 返回最新的投票数据
    const newVoteData = await voteUtils.findOne(voteParams, undefined, { lean: true })
    res.send({
      data: newVoteData,
      voted: true,
    })
    // 保存投票日志
    const ipInfo = await utils.IP2LocationUtils(ip, null, null, false)
    const voteLogParams = {
      vote: voteId,
      uuid,
      ipInfo,
      ip,
      deviceInfo: utils.deviceUAInfoUtils(req),
      options: optionIdList,
    }
    votelogUtils.save(voteLogParams)

  }).then(() => {
    console.info(`blogVote-${voteId} unlock`)
  }).catch((err) => {
    userApiLog.error(`blogVote-${voteId} unlock error, ${logErrorToText(err)}`)
  })
}
