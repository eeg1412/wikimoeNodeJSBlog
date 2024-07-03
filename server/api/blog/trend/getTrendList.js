const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const moment = require('moment-timezone');


module.exports = async function (req, res, next) {
  utils.executeInLock('getTrendList', async () => {
    const sidebarList = global.$cacheData.sidebarList || []
    const trendSidebar = sidebarList.find((item) => {
      return item.type === 12
    })
    // 不存在type为12的侧边栏
    if (!trendSidebar) {
      res.send({
        list: []
      })
      // reject
      return
    }
    // 存在type为3的侧边栏,获取count
    const limit = trendSidebar.count || 0
    // 如果count小于等于0，不获取最新评论列表
    if (count <= 0) {
      res.send({
        list: []
      })
      // reject
      return
    }

    // 获取缓存中的trendListData
    const trendListData = global.$cacheData.trendListData || null
    const startDate = moment().tz(siteTimeZone).startOf('day');
    if (trendListData) {
      // 判断 trendListData 中的date是否超过10分钟且是否是今天且limit是否相等
      if (moment(trendListData.date).isSame(startDate, 'day') && moment().diff(moment(trendListData.date), 'minutes') <= 10 && trendListData.limit === limit) {
        res.send({
          list: trendListData.list
        })
        // reject
        return
      }
      return
    }


    // 查询数据库
    const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
    const endDate = moment().tz(siteTimeZone).endOf('day');

    const pipe = [
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }, // 匹配创建时间在指定开始日期和结束日期之间的文档
          action: { $in: ['postView', 'postListSort', 'postListTag'] }, // 匹配动作为'postView', 'postListSort', 或 'postListTag'的文档
          isBot: false // 排除机器人行为
        }
      },
      {
        $group: {
          _id: "$data.targetId", // 按data.targetId分组
          target: { $first: "$data.target" }, // 获取每组的第一个data.target值
          count: { $sum: 1 } // 计算每组的文档数量
        }
      },
      {
        $sort: {
          count: -1, // 按count降序排列
          _id: -1 // 如果count相同，则按_id降序排列
        }
      },
      {
        $limit: limit // 限制结果数量为limit
      },
      {
        $lookup: {
          from: {
            $switch: {
              branches: [
                { case: { $eq: ["$target", "tag"] }, then: "tags" }, // 如果target是'tag'，则从'tags'集合中查找
                { case: { $eq: ["$target", "sort"] }, then: "sorts" }, // 如果target是'sort'，则从'sorts'集合中查找
                { case: { $in: ["$target", ["blog", "tweet", "page"]] }, then: "posts" } // 如果target是'blog', 'tweet', 或 'page'，则从'posts'集合中查找
              ],
              default: "otherCollection" // 默认从'otherCollection'集合中查找
            }
          },
          localField: "_id", // 本地字段为_id
          foreignField: "_id", // 外键字段也为_id
          as: "lookupResult" // 将查找结果存储为lookupResult
        }
      },
      {
        $unwind: "$lookupResult" // 展开lookupResult数组
      },
      {
        $addFields: {
          lookupResult: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$target", "tag"] },
                  then: {
                    tagname: "$lookupResult.tagname", // 如果target是'tag'，则保留tagname和_id
                    _id: "$lookupResult._id"
                  }
                },
                {
                  case: { $eq: ["$target", "sort"] },
                  then: {
                    sortname: "$lookupResult.sortname", // 如果target是'sort'，则保留sortname, alias, 和_id
                    alias: "$lookupResult.alias",
                    _id: "$lookupResult._id"
                  }
                },
                {
                  case: { $in: ["$target", ["blog", "tweet", "page"]] },
                  then: {
                    title: "$lookupResult.title", // 如果target是'blog', 'tweet', 或 'page'，则保留title, excerpt, alias, _id, 和status
                    excerpt: "$lookupResult.excerpt",
                    alias: "$lookupResult.alias",
                    _id: "$lookupResult._id",
                    status: "$lookupResult.status"
                  }
                }
              ],
              default: "$lookupResult" // 默认不修改lookupResult
            }
          }
        }
      },
      {
        $match: {
          $or: [
            { "target": { $nin: ["blog", "tweet", "page"] } }, // 排除target为'blog', 'tweet', 或 'page'的文档
            { "lookupResult.status": 1 } // 包括lookupResult.status为1的文档
          ]
        }
      },
      {
        $project: {
          _id: 1, // 保留_id
          target: 1, // 保留target
          count: 1, // 保留count
          details: "$lookupResult" // 保留lookupResult作为details
        }
      }
    ];
    readerlogUtils.aggregate(pipe).then((res) => {
      // 写入缓存
      res.send({
        list: res
      })
    }).catch((err) => {
      userApiLog.error(`getTrendList error, ${logErrorToText(err)}`)
    })
  }).then(() => {
    // 释放锁
    console.info('getTrendList unlock')
  }).catch((err) => {
    // 释放锁
    userApiLog.error(`getTrendList unlock error, ${logErrorToText(err)}`)
  })

}