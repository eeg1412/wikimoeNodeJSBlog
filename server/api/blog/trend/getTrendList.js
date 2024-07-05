const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')
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

    const postLikeLogPipe = [
      // 今天点赞的文章，startDate和endDate是今天的开始和结束,like为true
      {
        $match: {
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          like: true
        }
      },
      {
        $group: {
          _id: "$post",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1,
          date: -1,
          _id: -1
        }
      },
      // 最多取500条
      {
        $limit: 500
      },
      // lookup posts 只要tags和status
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "_id",
          as: "postDetail",
          pipeline: [
            { $project: { _id: 1, tags: 1, sort: 1, status: 1 } }
          ]
        }
      },
      {
        $unwind: { path: "$postDetail", preserveNullAndEmptyArrays: true }
      },
      // 过滤掉status不为1的文章
      {
        $match: {
          "postDetail.status": 1
        }
      },
    ]
    const postLikeLogData = await postLikeLogUtils.aggregate(postLikeLogPipe)
    // 遍历postLikeLogData，获取tag和sort
    const likeIdObjList = []
    postLikeLogData.forEach((item) => {
      const postDetail = item.postDetail
      if (postDetail) {
        const sort = postDetail.sort
        // 查询sortIdObjList中是否存在sort
        const sortIndex = likeIdObjList.findIndex((sortItem) => {
          return sortItem._id.toString() === sort.toString()
        })
        if (sortIndex === -1) {
          likeIdObjList.push({
            _id: sort,
            hot: item.count * 15
          })
        }

        const tags = postDetail.tags
        tags.forEach((tag) => {
          const tagIndex = likeIdObjList.findIndex((tagItem) => {
            return tagItem._id.toString() === tag.toString()
          })
          if (tagIndex === -1) {
            likeIdObjList.push({
              _id: tag,
              hot: item.count * 15
            })
          }
        })
        likeIdObjList.push({
          _id: item._id,
          hot: item.count * 30
        })
      }
    })

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
          hot: { $sum: 10 }
        }
      },
      {
        $addFields: {
          hot: {
            $add: [
              "$hot", // 引用 $group 阶段计算的 hot 值
              {
                $reduce: {
                  input: likeIdObjList,
                  initialValue: 0,
                  in: {
                    $cond: [
                      { $eq: ["$$this._id", "$_id"] }, // 检查当前文档的_id是否在likeIdObjList中
                      { $add: ["$$value", "$$this.hot"] }, // 如果是，加上likeIdObjList中对应的hot数值
                      "$$value" // 否则，保持当前累加值不变
                    ]
                  }
                }
              }
            ]
          }
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
    throw new Error(err)
  })

}