const postUtils = require('../../../mongodb/utils/posts')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const updateShare = async () => {
    const { isExceedMaxSize } = await utils.getReaderlogsSize()
    if (isExceedMaxSize) {
      userApiLog.error(`readerlogs超出最大存储容量`)
      return false
    }
    // - title	标题字段
    // - date	日期字段
    // - content	内容字段
    // - excerpt	摘要字段
    // - alias	别名字段
    // - sort	分类
    // - type	类型：1blog,2tweet,3page
    // - tags	标签字段[]

    // - top	是否置顶字段
    // - sortop	是否排序置顶字段
    // - status	状态字段：0草稿，1发布，99回收站
    // - allowRemark	是否允许评论字段
    // - template	模板字段
    // - code	文章插入的Code字段
    // - coverImages  博客时是封面图片字段，页面时是页面图片字段
    // - __v  版本号字段
    const id = req.body.id
    const sharePlatform = req.body.sharePlatform
    const uuid = req.headers['wmb-request-id']
    const ip = utils.getUserIp(req)
    // 判断uuid是否符合格式
    if (!utils.isUUID(uuid)) {
      return false
    }
    // 判断id是否符合格式
    if (!utils.isObjectId(id)) {
      return false
    }

    const { siteLogIPBlockList } = global.$globalConfig.IPBlockSettings
    // 校验IP黑名单
    if (siteLogIPBlockList.has(ip)) {
      console.info(`share count block by ip:${ip}`)
      return false
    }

    const { siteSharePlatforms } = global.$globalConfig.siteSettings
    // 校验sharePlatform是否在设置中
    if (!siteSharePlatforms.includes(sharePlatform)) {
      return false
    }

    // 根据ip或uuid，和 查询文章id， 和查询extraInfo.sharePlatform， 查询 readerlogUtils.count 中action字段 postShare 当天的数据量是否超过1条
    const readerlogPostShareCount = await readerlogUtils.count({
      $or: [
        {
          uuid: uuid
        },
        {
          ip: ip
        }
      ],
      // action字段 postShare
      action: 'postShare',
      createdAt: {
        $gte: utils.getTodayStartTime(),
        $lte: utils.getTodayEndTime()
      },
      'data.extraInfo.sharePlatform': sharePlatform,
      'data.targetId': id
    })
    if (readerlogPostShareCount >= 1) {
      return false
    }

    // 根据ip或uuid， 查询 readerlogUtils.count 中action字段 postShare 当天的数据量是否超过1000条
    const readerlogCount = await readerlogUtils.count({
      $or: [
        {
          uuid: uuid
        },
        {
          ip: ip
        }
      ],
      // action字段 postShare
      action: 'postShare',
      createdAt: {
        $gte: utils.getTodayStartTime(),
        $lte: utils.getTodayEndTime()
      }
    })
    if (readerlogCount >= 1000) {
      return false
    }

    const params = {
      // shares + 1
      $inc: {
        shares: 1
      }
    }

    const data = await postUtils.findOne({ _id: id })
    if (!data) {
      return false
    }
    let content = data.title || data.excerpt
    const type = data.type
    // 控制content长度在20字，超过...
    if (content.length > 20) {
      content = utils.limitStr(content, 20)
    }
    let target = ''
    switch (type) {
      case 1:
        target = 'blog'
        break
      case 2:
        target = 'tweet'
        break
      case 3:
        target = 'page'
        break
      default:
        break
    }
    const isSearchEngineResult = utils.isSearchEngine(req)
    if (isSearchEngineResult.isBot) {
      return false
    }
    const readerlogParams = {
      uuid: uuid,
      action: 'postShare',
      data: {
        target: target,
        targetId: id,
        content: content,
        extraInfo: {
          sharePlatform: sharePlatform
        }
      },
      ...isSearchEngineResult,
      deviceInfo: utils.deviceUAInfoUtils(req),
      ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
      ip: ip
    }
    readerlogUtils
      .save(readerlogParams)
      .then(data => {
        userApiLog.info(`post share log create success`)
      })
      .catch(err => {
        userApiLog.error(`post share log create fail, ${logErrorToText(err)}`)
      })

    // 查询post的shares是否超过20亿，如果超过20亿，不再增加
    if (data.shares + 1 >= 2000000000) {
      userApiLog.error(`post share count exceed 2 billion`)
      return false
    }

    postUtils
      .updateOne({ _id: id }, params, true)
      .then(data => {
        userApiLog.info(`post share update success`)
      })
      .catch(err => {
        userApiLog.error(`post share update fail, ${logErrorToText(err)}`)
      })
    return true
  }

  const updateRes = await updateShare()
  if (updateRes) {
    res.send({
      add: true
    })
  } else {
    res.send({
      add: false
    })
  }
}
