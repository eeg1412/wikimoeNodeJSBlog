const sorts = require('../../../mongodb/models/sorts');
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const moment = require('moment-timezone');


module.exports = async function (req, res, next) {
  utils.executeInLock('getTrendPostList', async () => {
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
    const trendListData = global.$cacheData.trendListData || null;
    const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai';
    const startDate = moment().tz(siteTimeZone).startOf('day');

    let shouldUpdate = true;
    if (trendListData) {
      res.send({
        list: trendListData.list
      })
      // 确保trendListData.date也在相同的时区
      const trendListDateWithTimeZone = moment(trendListData.date).tz(siteTimeZone);
      const isSameDay = trendListDateWithTimeZone.isSame(startDate, 'day');
      const isSameLimit = trendListData.limit === limit;
      // 使用带时区的日期进行分钟差异比较
      const isDiffSeconds = moment().tz(siteTimeZone).diff(trendListDateWithTimeZone, 'seconds');
      const isOverTime = isDiffSeconds <= 10 * 60;
      if (isSameDay && isOverTime && isSameLimit) {
        shouldUpdate = false;
        // reject
        return
      }
    }

    if (shouldUpdate) {
      console.info('getTrendPostList should update')
      // 查询数据库
      const endDate = moment().tz(siteTimeZone).endOf('day');

      const pipe = [
        {
          $match: {
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
            action: { $in: ['postView', 'postLike', 'postDislike'] },
            isBot: false
          }
        },
        {
          $group: {
            _id: "$data.targetId",
            target: { $first: "$data.target" },
            hot: {
              $sum: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$action", "postDislike"] }, then: -50 },
                    { case: { $eq: ["$action", "postLike"] }, then: 50 },
                  ],
                  default: 10 // 其他情况下增加10分
                }
              }
            }
          }
        },
        {
          $match: {
            hot: { $gt: 0 }
          }
        },
        {
          $sort: {
            hot: -1,
            _id: -1
          }
        },
        {
          $limit: limit
        },
        {
          $addFields: {
            post: {
              $cond: { if: { $in: ["$target", ["blog", "tweet", "page"]] }, then: "$_id", else: "$$REMOVE" }
            }
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
              {
                $addFields: {
                  coverImage: {
                    $cond: {
                      if: { $eq: [{ $size: "$coverImages" }, 0] },
                      then: [],
                      else: [{ $arrayElemAt: ["$coverImages", 0] }]
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: "attachments",
                  localField: "coverImage",
                  foreignField: "_id",
                  as: "coverImage"
                }
              },
              { $unwind: { path: "$coverImage", preserveNullAndEmptyArrays: true } },

              { $project: { _id: 1, title: 1, alias: 1, excerpt: 1, coverImage: 1 } }
            ],
            as: "postDetail"
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
              { "postDetail": { $exists: true, $ne: null } }
            ]
          }
        },
      ];
      await readerlogUtils.aggregate(pipe).then((data) => {
        // 写入缓存
        global.$cacheData.trendListData = {
          date: moment().toDate(),
          list: data,
          limit: limit
        }
        if (!trendListData) {
          console.info('getTrendPostList should send new data')
          res.send({
            list: data
          })
        }

      }).catch((err) => {
        userApiLog.error(`getTrendPostList error, ${logErrorToText(err)}`)
      })
    }
  }).then(() => {
    // 释放锁
    console.info('getTrendPostList unlock')
  }).catch((err) => {
    // 释放锁
    userApiLog.error(`getTrendPostList unlock error, ${logErrorToText(err)}`)
  })

}