const sorts = require('../../../mongodb/models/sorts');
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
    const trendListData = global.$cacheData.trendListData || null;
    const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai';
    const startDate = moment().tz(siteTimeZone).startOf('day');
    if (trendListData) {
      // 确保trendListData.date也在相同的时区
      const trendListDateWithTimeZone = moment(trendListData.date).tz(siteTimeZone);
      const isSameDay = trendListDateWithTimeZone.isSame(startDate, 'day');
      const isSameLimit = trendListData.limit === limit;
      // 使用带时区的日期进行分钟差异比较
      const isDiffSeconds = moment().tz(siteTimeZone).diff(trendListDateWithTimeZone, 'seconds');
      const isOverTime = isDiffSeconds <= 10 * 60;
      if (isSameDay && isOverTime && isSameLimit) {
        res.send({
          list: trendListData.list
        })
        // reject
        return
      }
    }


    // 查询数据库
    const endDate = moment().tz(siteTimeZone).endOf('day');

    const pipe = [
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          action: { $in: ['postView', 'postListSort', 'postListTag', 'postLike', 'postDislike'] },
          isBot: false
        }
      },
      {
        $group: {
          _id: "$data.targetId",
          target: { $first: "$data.target" },
          likes: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$action", "postLike"] }, then: 1 },
                  { case: { $eq: ["$action", "postDislike"] }, then: -1 }
                ],
                default: 0 // 其他action类型不计算
              }
            }
          },
          count: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$action", "postLike"] }, then: 0 },
                  { case: { $eq: ["$action", "postDislike"] }, then: 0 }
                ],
                default: 1 // 除了postLike和postDislike外的action类型计数
              }
            }
          },
          hot: {
            $sum: {
              $cond: {
                if: { $eq: ["$action", "postDislike"] },
                then: -10, // 如果是postDislike，不增加hot
                else: 10 // 其他情况下增加10分
              }
            }
          }
        }
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
            { $project: { _id: 1, title: 1, alias: 1, excerpt: 1, tags: 1, sort: 1 } }
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
        $addFields: {
          "postDetail.tags": {
            $map: {
              input: "$postDetail.tags",
              as: "tag",
              in: {
                _id: "$$tag",
                tag: "$$tag",
                target: "tag",
                likes: "$likes",
                hot: { $multiply: ["$count", 3] } // 假设 $$count 是你想乘以 10 的字段
              }
            }
          }
        }
      },
      {
        $addFields: {
          "postDetail.sort": {
            _id: "$postDetail.sort",
            target: "sort",
            likes: "$likes",
            sort: "$postDetail.sort",
            hot: { $multiply: ["$count", 3] }
          }
        }
      },
      {
        $facet: {
          posts: [
            {
              $project: {
                _id: 1,
                target: 1,
                likes: 1,
                count: 1,
                hot: 1,
                post: 1,
                tag: 1,
                sort: 1,
                postDetail: {
                  _id: 1,
                  title: 1,
                  excerpt: 1,
                  alias: 1
                  // 排除tags字段
                }
              }
            }
          ],
          tags: [
            { $unwind: "$postDetail.tags" },
            { $match: { "postDetail.tags._id": { $exists: true, $ne: null } } },
            {
              $replaceRoot: { newRoot: "$postDetail.tags" }
            }
          ],
          sorts: [
            {
              $match: {
                "postDetail.sort._id": { $exists: true, $ne: null }
              }
            },
            {
              $replaceRoot: { newRoot: "$postDetail.sort" }
            }
          ]
        }
      },
      {
        $project: {
          combined: { $concatArrays: ["$posts", "$tags", "$sorts"] }
        }
      },
      { $unwind: "$combined" },
      { $replaceRoot: { newRoot: "$combined" } },
      {
        $group: {
          _id: "$_id",
          target: { $first: "$target" },
          likes: { $first: "$likes" },
          hot: {
            $sum: {
              $add: [
                "$hot", // 原有的hot数量
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$target", "blog"] }, then: { $multiply: ["$likes", 20] } },
                      { case: { $eq: ["$target", "tweet"] }, then: { $multiply: ["$likes", 20] } },
                      { case: { $eq: ["$target", "page"] }, then: { $multiply: ["$likes", 20] } },
                      { case: { $eq: ["$target", "tag"] }, then: { $multiply: ["$likes", 10] } },
                      { case: { $eq: ["$target", "sort"] }, then: { $multiply: ["$likes", 10] } }
                    ],
                    default: 0
                  }
                }
              ]
            }
          },
          post: { $first: "$post" },
          tag: { $first: "$tag" },
          sort: { $first: "$sort" },
          postDetail: { $first: "$postDetail" }
        }
      },
      // 筛选掉hot小于等于0的数据
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
        $match: {
          $or: [
            { "tagDetail": { $exists: true, $ne: null } },
            { "sortDetail": { $exists: true, $ne: null } },
            { "postDetail": { $exists: true, $ne: null } }
          ]
        }
      },
    ];
    console.time('trend aggregate')
    await readerlogUtils.aggregate(pipe).then((data) => {
      console.timeEnd('trend aggregate')
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