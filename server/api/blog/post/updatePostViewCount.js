
const postUtils = require('../../../mongodb/utils/posts')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  res.send({
  })
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
  const uuid = req.headers['x-request-id']
  const ip = utils.getUserIp(req)
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    return
  }
  // 判断id是否符合格式
  if (!utils.isObjectId(id)) {
    return
  }

  // 根据ip或uuid， 查询 readerlogUtils.count 中action字段 postView 当天的数据量是否超过1000条
  const readerlogCount = await readerlogUtils.count({
    $or: [
      {
        uuid: uuid
      },
      {
        ip: ip
      }
    ],
    // action字段 postView
    action: 'postView',
    createdAt: {
      $gte: utils.getTodayStartTime(),
      $lte: utils.getTodayEndTime()
    }
  })
  if (readerlogCount >= 1000) {
    return
  }

  const params = {
    // views + 1
    $inc: {
      views: 1
    }
  }


  // 更新
  postUtils.findOneAndUpdate({ _id: id }, params, { new: true }).then(async (data) => {
    userApiLog.info(`post view update success`)
    // 添加阅读日志
    // 操作者的uuid
    // uuid: {
    //   type: String,
    //   required: true,
    // },
    // // 操作了什么
    // action: {
    //   type: String,
    //   required: true,
    // },
    // // data
    // data: {
    //   // object
    //   type: Object,
    //   default: {}
    // },
    // // ip
    // ip: {
    //   type: String,
    // },
    // ipInfo: {
    //   type: Object,
    //   default: {}
    // },
    // deviceInfo: {
    //   type: Object,
    //   default: {}
    // },
    let content = data.title || data.excerpt
    // 控制content长度在20字，超过...
    if (content.length > 20) {
      content = content.substring(0, 20) + '...'
    }
    const readerlogParams = {
      uuid: uuid,
      action: 'postView',
      data: {
        target: 'post',
        targetId: id,
        content: content,
      },
      isBot: utils.isSearchEngine(req),
      deviceInfo: utils.deviceUAInfoUtils(req),
      ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
      ip: ip
    }
    readerlogUtils.save(readerlogParams).then((data) => {
      userApiLog.info(`post view log create success`)
    }).catch((err) => {
      userApiLog.error(`post view log create fail, ${JSON.stringify(err)}`)
    })
  }).catch((err) => {
    userApiLog.error(`post view update fail, ${JSON.stringify(err)}`)
  })

}
