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

    // 获取缓存中的trendPostListData
    const trendPostListData = global.$cacheData.trendPostListData || null;

    let shouldUpdate = true;
    if (trendPostListData) {
      res.send({
        list: trendPostListData.list
      })
      // 确保trendPostListData.date也在相同的时区
      const trendPostListDate = trendPostListData.date;
      const isSameLimit = trendPostListData.limit === limit;
      // 使用带时区的日期进行分钟差异比较
      const isDiffSeconds = moment().diff(trendPostListDate, 'seconds');
      const isWithinTimeLimit = isDiffSeconds <= 2 * 60;
      if (isWithinTimeLimit && isSameLimit) {
        shouldUpdate = false;
        // reject
        return
      }
    }

    if (shouldUpdate) {
      console.info('getTrendPostList should update')
      // 查询数据库
      // 获取24小时前的时间
      const twentyFourHoursAgo = moment().subtract(24, 'hours');

      const pipe = [
        {
          $match: {
            createdAt: { $gte: twentyFourHoursAgo.toDate() },
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
                    { case: { $eq: ["$action", "postDislike"] }, then: -51 },
                    { case: { $eq: ["$action", "postLike"] }, then: 51 },
                  ],
                  default: 13 // 其他情况下
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            pipeline: [
              {
                $match: {
                  date: { $gte: twentyFourHoursAgo.toDate() },
                  status: 1,
                  $or: [
                    { user: null },
                    { user: { $exists: false } }
                  ]
                }
              },
              {
                $project: {
                  _id: 1,
                }
              }
            ],
            as: "comments"
          }
        },
        {
          $addFields: {
            hot: { $add: ["$hot", { $multiply: [{ $size: "$comments" }, 91] }] }
          }
        },
        {
          $project: {
            comments: 0, // 不包含comments字段
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
          $lookup: {
            from: "posts",
            localField: "_id",
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
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        filepath: 1,
                        mimetype: 1,
                        thumfor: 1,
                      }
                    },
                  ],
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
        global.$cacheData.trendPostListData = {
          date: moment().toDate(),
          list: data,
          limit: limit
        }
        if (!trendPostListData) {
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