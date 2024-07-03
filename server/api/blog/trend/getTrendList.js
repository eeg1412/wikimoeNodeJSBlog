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
    if (limit <= 0) {
      res.send({
        list: []
      })
      // reject
      return
    }

    // 获取缓存中的trendListData
    const trendListData = global.$cacheData.trendListData || null
    const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
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
    const endDate = moment().tz(siteTimeZone).endOf('day');

    const pipe = [
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          action: { $in: ['postView', 'postListSort', 'postListTag'] },
          isBot: false
        }
      },
      {
        $group: {
          _id: "$data.targetId",
          target: { $first: "$data.target" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1,
          _id: -1
        }
      },
      {
        $limit: limit
      },
      {
        $addFields: {
          tag: {
            $cond: { if: { $eq: ["$target", "tag"] }, then: "$_id", else: "$$REMOVE" }
          },
          sort: {
            $cond: { if: { $eq: ["$target", "sort"] }, then: "$_id", else: "$$REMOVE" }
          },
          post: {
            $cond: { if: { $in: ["$target", ["blog", "tweet", "page"]] }, then: "$_id", else: "$$REMOVE" }
          }
        }
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag",
          foreignField: "_id",
          as: "tagDetail",
          pipeline: [
            { $project: { _id: 1, tagname: 1 } } // 仅返回需要的字段
          ]
        }
      },
      {
        $lookup: {
          from: "sorts",
          localField: "sort",
          foreignField: "_id",
          as: "sortDetail",
          pipeline: [
            { $project: { sortname: 1, alias: 1, _id: 1 } } // 仅返回需要的字段
          ]
        }
      },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          pipeline: [
            {
              $match:
              {
                $expr:
                {
                  $and: [
                    { $eq: ["$status", 1] }
                  ]
                }
              }
            },
            { $project: { _id: 1, title: 1, alias: 1, excerpt: 1 } }
          ],
          as: "postDetail"
        }
      },
      {
        $unwind: {
          path: "$tagDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$sortDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$postDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            { "tagDetail": { $exists: true, $ne: null } },
            { "sortDetail": { $exists: true, $ne: null } },
            { "postDetail": { $exists: true, $ne: null } }
          ]
        }
      },
    ];
    readerlogUtils.aggregate(pipe).then((data) => {
      // 写入缓存
      global.$cacheData.trendListData = {
        date: moment().toDate(),
        list: data,
        limit: limit
      }
      res.send({
        list: data
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