const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone');
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')


module.exports = async function (req, res, next) {
  const startTime = req.query.startTime
  const endTime = req.query.endTime

  const limit = 100

  // 时间格式是 2023-08-10T15:00:00.000Z 需要判断合法性
  const rule = [
    // startTime
    {
      key: 'startTime',
      label: '开始时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true,
      },
    },
    // endTime
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true,
      },
    },
  ]

  const errors = utils.checkForm({
    startTime, endTime
  }, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }


  const promiseArray = []

  const startDate = moment(startTime)
  const endDate = moment(endTime)
  const siteRankIgnoreReferrerDomainList = global.$globalConfig?.otherSettings?.siteRankIgnoreReferrerDomainList || []
  const siteRankIgnoreReferrerDomainListReg = siteRankIgnoreReferrerDomainList.map(domain => new RegExp(domain, 'i'))

  // 来源站统计
  const readReferrerpipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['open'] },
        referrer: { $ne: null, $nin: siteRankIgnoreReferrerDomainListReg },
        isBot: false
      }
    },
    // 统计每个referrer出现的次数
    {
      $group: {
        _id: "$referrer",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    }
  ]
  const readReferrerData = readerlogUtils.aggregate(readReferrerpipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })
  promiseArray.push(readReferrerData)

  // 单位时间内最受欢迎的文章
  const readPostViewPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postView'] },
        isBot: false
      }
    },
    // 根据{data.targetId} 分组
    {
      $group: {
        _id: "$data.targetId",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    },
    // 根据id查询posts,只要返回id,title,excerpt,type
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "post"
      }
    },
    {
      $unwind: "$post"
    },
    {
      $project: {
        _id: 1,
        count: 1,
        title: "$post.title",
        excerpt: "$post.excerpt",
        type: "$post.type"
      }
    }
  ]

  const readPostViewData = readerlogUtils.aggregate(readPostViewPipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })
  promiseArray.push(readPostViewData)

  // 单位时间 postLike 
  const readPostLikePipeline = [
    {
      $match: {
        date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        like: true
      }
    },
    // 根据{post} 分组
    {
      $group: {
        _id: "$post",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    },
    // 根据id查询posts,只要返回id,title,excerpt,type
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "post"
      }
    },
    {
      $unwind: "$post"
    },
    {
      $project: {
        _id: 1,
        count: 1,
        title: "$post.title",
        excerpt: "$post.excerpt",
        type: "$post.type"
      }
    }
  ]
  const readPostLikeData = postLikeLogUtils.aggregate(readPostLikePipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })

  promiseArray.push(readPostLikeData)

  // 单位时间分类访问排行 postListSort
  const readPostListSortPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListSort'] },
        isBot: false
      }
    },
    // 根据{data.targetId} 分组
    {
      $group: {
        _id: "$data.targetId",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    },
    // 根据id查询sorts,只要返回id,sortname
    {
      $lookup: {
        from: "sorts",
        localField: "_id",
        foreignField: "_id",
        as: "sort"
      }
    },
    {
      $unwind: "$sort"
    },
    {
      $project: {
        _id: 1,
        count: 1,
        sortname: "$sort.sortname"
      }
    }
  ]
  const readPostListSortData = readerlogUtils.aggregate(readPostListSortPipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })

  promiseArray.push(readPostListSortData)

  // 单位时间标签访问排行 postListTag
  const readPostListTagPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListTag'] },
        isBot: false
      }
    },
    // 根据{data.targetId} 分组
    {
      $group: {
        _id: "$data.targetId",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    },
    // 根据id查询tags,只要返回id,tagname
    {
      $lookup: {
        from: "tags",
        localField: "_id",
        foreignField: "_id",
        as: "tag"
      }
    },
    {
      $unwind: "$tag"
    },
    {
      $project: {
        _id: 1,
        count: 1,
        tagname: "$tag.tagname"
      }
    }
  ]
  const readPostListTagData = readerlogUtils.aggregate(readPostListTagPipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })

  promiseArray.push(readPostListTagData)

  // 单位时间关键词搜索排行 postListKeyword
  const readPostListKeywordPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListKeyword'] },
        isBot: false
      }
    },
    // 根据{data.content} 分组
    {
      $group: {
        _id: "$data.content",
        count: { $sum: 1 }
      }
    },
    // 按照次数排序
    {
      $sort: {
        count: -1,
        _id: -1
      }
    },
    // 只取前10
    {
      $limit: limit
    }
  ]
  const readPostListKeywordData = readerlogUtils.aggregate(readPostListKeywordPipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })


  promiseArray.push(readPostListKeywordData)


  try {
    const [
      readReferrerData,
      readPostViewData,
      readPostLikeData,
      readPostListSortData,
      readPostListTagData,
      readPostListKeywordData
    ] = await Promise.all(promiseArray);

    if (!readReferrerData || !readPostViewData || !readPostLikeData || !readPostListSortData || !readPostListTagData || !readPostListKeywordData) {
      res.status(500).json({
        errors: [{
          message: '数据库查询错误'
        }]
      });
      return;
    }

    let sendData = {
      readReferrerData: readReferrerData,
      readPostViewData: readPostViewData,
      readPostLikeData: readPostLikeData,
      readPostListSortData: readPostListSortData,
      readPostListTagData: readPostListTagData,
      readPostListKeywordData: readPostListKeywordData
    };

    // 发送响应
    res.send(sendData);
  } catch (error) {
    console.error(error);
    adminApiLog.error(error);
    res.status(500).json({
      errors: [{
        message: '服务器内部错误'
      }]
    });
  }
}
