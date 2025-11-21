const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')

module.exports = async function (req, res, next) {
  const startTime = req.query.startTime
  const endTime = req.query.endTime
  const dataSortPriority = req.query.dataSortPriority || 'ip'

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
        strictSeparator: true
      }
    },
    // endTime
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true
      }
    },
    // dataSortPriority
    {
      key: 'dataSortPriority',
      label: '数据排序优先级',
      type: 'isIn',
      required: false,
      options: ['ip', 'pv']
    }
  ]

  const errors = utils.checkForm(
    {
      startTime,
      endTime,
      dataSortPriority
    },
    rule
  )
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const promiseArray = []

  const startDate = moment(startTime)
  const endDate = moment(endTime)
  const siteRankIgnoreReferrerDomainList =
    global.$globalConfig?.otherSettings?.siteRankIgnoreReferrerDomainList || []
  const siteRankIgnoreReferrerDomainListReg =
    siteRankIgnoreReferrerDomainList.map(domain => new RegExp(domain, 'i'))

  /**
   * 生成排序规则对象
   * @param {string} priority - 排序优先级：'ip' 或 'pv'
   * @returns {object} MongoDB 排序对象
   */
  const getSortRule = (priority = 'ip') => {
    const sortRule = {}

    if (priority === 'pv') {
      sortRule.pvCount = -1
      sortRule.ipCount = -1
    } else {
      // 默认 IP 优先
      sortRule.ipCount = -1
      sortRule.pvCount = -1
    }

    return sortRule
  }

  const ippvSortRule = getSortRule(dataSortPriority)

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
    // 统计每个referrer的PV和IP
    {
      $group: {
        _id: '$referrer',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    // 按照IP数排序
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    // 只取前100
    {
      $limit: limit
    }
  ]
  const readReferrerData = readerlogUtils
    .aggregate(readReferrerpipeline)
    .catch(err => {
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
    // 根据{data.targetId} 分组，统计PV和IP
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    // 按照IP数排序
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    // 只取前100
    {
      $limit: limit
    },
    // 根据id查询posts,只要返回id,title,excerpt,type
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: '_id',
        as: 'post'
      }
    },
    {
      $unwind: '$post'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$post.title',
        excerpt: '$post.excerpt',
        type: '$post.type'
      }
    }
  ]

  const readPostViewData = readerlogUtils
    .aggregate(readPostViewPipeline)
    .catch(err => {
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
        _id: '$post',
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
        from: 'posts',
        localField: '_id',
        foreignField: '_id',
        as: 'post'
      }
    },
    {
      $unwind: '$post'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        title: '$post.title',
        excerpt: '$post.excerpt',
        type: '$post.type'
      }
    }
  ]
  const readPostLikeData = postLikeLogUtils
    .aggregate(readPostLikePipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostLikeData)

  // 单位时间 postShare
  const readPostSharePipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postShare'] },
        isBot: false
      }
    },
    // 根据{data.targetId} 分组
    {
      $group: {
        _id: '$data.targetId',
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
        from: 'posts',
        localField: '_id',
        foreignField: '_id',
        as: 'post'
      }
    },
    {
      $unwind: '$post'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        title: '$post.title',
        excerpt: '$post.excerpt',
        type: '$post.type'
      }
    }
  ]
  const readPostShareData = readerlogUtils
    .aggregate(readPostSharePipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostShareData)

  // 单位时间分享方式统计 postSharePlatform
  const readPostSharePlatformPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postShare'] },
        'data.extraInfo.sharePlatform': { $exists: true, $ne: null, $ne: '' },
        isBot: false
      }
    },
    // 根据{data.extraInfo.sharePlatform} 分组
    {
      $group: {
        _id: '$data.extraInfo.sharePlatform',
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
    // 只取前100
    {
      $limit: limit
    }
  ]
  const readPostSharePlatformData = readerlogUtils
    .aggregate(readPostSharePlatformPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostSharePlatformData)

  // 单位时间分类访问排行 postListSort
  const readPostListSortPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListSort'] },
        isBot: false
      }
    },
    // 根据{data.targetId} 分组，统计PV和IP
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    // 按照IP数排序
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    // 只取前100
    {
      $limit: limit
    },
    // 根据id查询sorts,只要返回id,sortname
    {
      $lookup: {
        from: 'sorts',
        localField: '_id',
        foreignField: '_id',
        as: 'sort'
      }
    },
    {
      $unwind: '$sort'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        sortname: '$sort.sortname'
      }
    }
  ]
  const readPostListSortData = readerlogUtils
    .aggregate(readPostListSortPipeline)
    .catch(err => {
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
    // 根据{data.targetId} 分组，统计PV和IP
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    // 按照IP数排序
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    // 只取前100
    {
      $limit: limit
    },
    // 根据id查询tags,只要返回id,tagname
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tag'
      }
    },
    {
      $unwind: '$tag'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        tagname: '$tag.tagname'
      }
    }
  ]
  const readPostListTagData = readerlogUtils
    .aggregate(readPostListTagPipeline)
    .catch(err => {
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
    // 根据{data.content} 分组，统计PV和IP
    {
      $group: {
        _id: '$data.content',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    // 按照IP数排序
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    // 只取前100
    {
      $limit: limit
    }
  ]
  const readPostListKeywordData = readerlogUtils
    .aggregate(readPostListKeywordPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListKeywordData)

  // 单位时间番剧列表访问排行 postListBangumi
  const readPostListBangumiPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListBangumi'] },
        isBot: false
      }
    },
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'bangumis',
        localField: '_id',
        foreignField: '_id',
        as: 'bangumi'
      }
    },
    {
      $unwind: '$bangumi'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$bangumi.title'
      }
    }
  ]
  const readPostListBangumiData = readerlogUtils
    .aggregate(readPostListBangumiPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListBangumiData)

  // 单位时间电影列表访问排行 postListMovie
  const readPostListMoviePipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListMovie'] },
        isBot: false
      }
    },
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie'
      }
    },
    {
      $unwind: '$movie'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$movie.title'
      }
    }
  ]
  const readPostListMovieData = readerlogUtils
    .aggregate(readPostListMoviePipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListMovieData)

  // 单位时间书籍列表访问排行 postListBook
  const readPostListBookPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListBook'] },
        isBot: false
      }
    },
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    {
      $unwind: '$book'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$book.title'
      }
    }
  ]
  const readPostListBookData = readerlogUtils
    .aggregate(readPostListBookPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListBookData)

  // 单位时间游戏列表访问排行 postListGame
  const readPostListGamePipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListGame'] },
        isBot: false
      }
    },
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'games',
        localField: '_id',
        foreignField: '_id',
        as: 'game'
      }
    },
    {
      $unwind: '$game'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$game.title'
      }
    }
  ]
  const readPostListGameData = readerlogUtils
    .aggregate(readPostListGamePipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListGameData)

  // 单位时间地点列表访问排行 postListMappoint
  const readPostListMappointPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: ['postListMappoint'] },
        isBot: false
      }
    },
    {
      $group: {
        _id: '$data.targetId',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: {
        ...ippvSortRule,
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'mappoints',
        localField: '_id',
        foreignField: '_id',
        as: 'mappoint'
      }
    },
    {
      $unwind: '$mappoint'
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: 1,
        title: '$mappoint.title'
      }
    }
  ]
  const readPostListMappointData = readerlogUtils
    .aggregate(readPostListMappointPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })

  promiseArray.push(readPostListMappointData)

  // 设备和地理位置统计 - 合并在一个聚合查询中以减少查询次数
  const deviceAndLocationPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: 'open',
        isBot: false
      }
    },
    {
      // 只保留需要的字段，减少后续处理的数据量
      $project: {
        deviceInfo: 1,
        ipInfo: 1,
        ip: 1
      }
    },
    {
      $facet: {
        // 浏览器统计，包含版本信息
        browserStats: [
          {
            $match: {
              'deviceInfo.browser.name': { $exists: true, $ne: null }
            }
          },
          // 预处理：规范化版本号
          {
            $project: {
              browserName: '$deviceInfo.browser.name',
              browserVersion: {
                $ifNull: [
                  // 先处理字段不存在的情况
                  {
                    $cond: [
                      // 再处理空字符串
                      { $eq: ['$deviceInfo.browser.version', ''] },
                      '未知版本',
                      '$deviceInfo.browser.version'
                    ]
                  },
                  '未知版本' // 字段不存在时返回"未知版本"
                ]
              },
              ip: 1
            }
          },
          // 直接按浏览器名称+版本分组，避免中间步骤
          {
            $group: {
              _id: {
                name: '$browserName',
                version: '$browserVersion'
              },
              pvCount: { $sum: 1 },
              ips: { $addToSet: '$ip' }
            }
          },
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: { $size: '$ips' }
            }
          },
          // 按浏览器名称重新分组
          {
            $group: {
              _id: '$_id.name',
              pvCount: { $sum: '$pvCount' },
              ipCount: { $sum: '$ipCount' },
              versions: {
                $push: {
                  version: '$_id.version',
                  pvCount: '$pvCount',
                  ipCount: '$ipCount'
                }
              }
            }
          },
          // 对版本数组排序（按IP数）
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              sortedVersions: {
                $sortArray: {
                  input: '$versions',
                  sortBy: { ...ippvSortRule }
                }
              }
            }
          },
          // 分离前10个和剩余的版本
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              top10: { $slice: ['$sortedVersions', 0, 10] },
              remainingPvCount: {
                $cond: {
                  if: { $gt: [{ $size: '$sortedVersions' }, 10] },
                  then: {
                    $sum: {
                      $map: {
                        input: {
                          $slice: [
                            '$sortedVersions',
                            10,
                            { $subtract: [{ $size: '$sortedVersions' }, 10] }
                          ]
                        },
                        as: 'item',
                        in: '$$item.pvCount'
                      }
                    }
                  },
                  else: 0
                }
              },
              remainingIpCount: {
                $cond: {
                  if: { $gt: [{ $size: '$sortedVersions' }, 10] },
                  then: {
                    $sum: {
                      $map: {
                        input: {
                          $slice: [
                            '$sortedVersions',
                            10,
                            { $subtract: [{ $size: '$sortedVersions' }, 10] }
                          ]
                        },
                        as: 'item',
                        in: '$$item.ipCount'
                      }
                    }
                  },
                  else: 0
                }
              }
            }
          },
          // 添加"其他"项
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              children: {
                $cond: {
                  if: { $gt: ['$remainingPvCount', 0] },
                  then: {
                    $concatArrays: [
                      '$top10',
                      [
                        {
                          version: '其他',
                          pvCount: '$remainingPvCount',
                          ipCount: '$remainingIpCount'
                        }
                      ]
                    ]
                  },
                  else: '$top10'
                }
              }
            }
          },
          // 排序
          {
            $sort: { ...ippvSortRule }
          },
          {
            $limit: limit
          }
        ],
        // 操作系统统计，包含版本信息
        osStats: [
          {
            $match: {
              'deviceInfo.os.name': { $exists: true, $ne: null }
            }
          },
          // 预处理：规范化版本号
          {
            $project: {
              osName: '$deviceInfo.os.name',
              osVersion: {
                $ifNull: [
                  // 先处理字段不存在的情况
                  {
                    $cond: [
                      // 再处理空字符串
                      { $eq: ['$deviceInfo.os.version', ''] },
                      '未知版本',
                      '$deviceInfo.os.version'
                    ]
                  },
                  '未知版本' // 字段不存在时返回"未知版本"
                ]
              },
              ip: 1
            }
          },
          // 直接按操作系统名称+版本分组
          {
            $group: {
              _id: {
                name: '$osName',
                version: '$osVersion'
              },
              pvCount: { $sum: 1 },
              ips: { $addToSet: '$ip' }
            }
          },
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: { $size: '$ips' }
            }
          },
          // 按操作系统名称重新分组
          {
            $group: {
              _id: '$_id.name',
              pvCount: { $sum: '$pvCount' },
              ipCount: { $sum: '$ipCount' },
              versions: {
                $push: {
                  version: '$_id.version',
                  pvCount: '$pvCount',
                  ipCount: '$ipCount'
                }
              }
            }
          },
          // 对版本数组排序（按IP数）
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              sortedVersions: {
                $sortArray: {
                  input: '$versions',
                  sortBy: { ...ippvSortRule }
                }
              }
            }
          },
          // 分离前10个和剩余的版本
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              top10: { $slice: ['$sortedVersions', 0, 10] },
              remainingPvCount: {
                $cond: {
                  if: { $gt: [{ $size: '$sortedVersions' }, 10] },
                  then: {
                    $sum: {
                      $map: {
                        input: {
                          $slice: [
                            '$sortedVersions',
                            10,
                            { $subtract: [{ $size: '$sortedVersions' }, 10] }
                          ]
                        },
                        as: 'item',
                        in: '$$item.pvCount'
                      }
                    }
                  },
                  else: 0
                }
              },
              remainingIpCount: {
                $cond: {
                  if: { $gt: [{ $size: '$sortedVersions' }, 10] },
                  then: {
                    $sum: {
                      $map: {
                        input: {
                          $slice: [
                            '$sortedVersions',
                            10,
                            { $subtract: [{ $size: '$sortedVersions' }, 10] }
                          ]
                        },
                        as: 'item',
                        in: '$$item.ipCount'
                      }
                    }
                  },
                  else: 0
                }
              }
            }
          },
          // 添加"其他"项
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: 1,
              children: {
                $cond: {
                  if: { $gt: ['$remainingPvCount', 0] },
                  then: {
                    $concatArrays: [
                      '$top10',
                      [
                        {
                          version: '其他',
                          pvCount: '$remainingPvCount',
                          ipCount: '$remainingIpCount'
                        }
                      ]
                    ]
                  },
                  else: '$top10'
                }
              }
            }
          },
          // 按总IP数量排序
          {
            $sort: { ...ippvSortRule }
          },
          {
            $limit: limit
          }
        ],
        // 国家统计
        countryStats: [
          {
            $match: {
              'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' }
            }
          },
          {
            $group: {
              _id: '$ipInfo.countryLong',
              pvCount: { $sum: 1 },
              ips: { $addToSet: '$ip' }
            }
          },
          {
            $project: {
              _id: 1,
              pvCount: 1,
              ipCount: { $size: '$ips' }
            }
          },
          {
            $sort: { ...ippvSortRule }
          },
          {
            $limit: limit
          }
        ],
        // 国家+地区统计
        regionStats: [
          {
            $match: {
              'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' },
              'ipInfo.region': { $exists: true, $ne: null, $ne: '-' }
            }
          },
          {
            $group: {
              _id: { country: '$ipInfo.countryLong', region: '$ipInfo.region' },
              pvCount: { $sum: 1 },
              ips: { $addToSet: '$ip' }
            }
          },
          {
            $project: {
              _id: 0,
              location: {
                $cond: {
                  if: { $eq: ['$_id.country', '$_id.region'] },
                  then: '$_id.country', // 如果国家和地区相同，只显示一次
                  else: { $concat: ['$_id.country', ' ', '$_id.region'] } // 否则显示国家+空格+地区
                }
              },
              ipInfo: {
                countryLong: '$_id.country',
                region: '$_id.region'
              },
              pvCount: 1,
              ipCount: { $size: '$ips' }
            }
          },
          {
            $sort: { ...ippvSortRule }
          },
          {
            $limit: limit
          }
        ]
      }
    }
  ]

  const deviceAndLocationData = readerlogUtils
    .aggregate(deviceAndLocationPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })
  promiseArray.push(deviceAndLocationData)

  // 新增：搜索引擎爬虫统计
  const botStatsPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: 'open',
        isBot: true,
        botName: { $exists: true, $ne: null, $ne: '' }
      }
    },
    {
      $group: {
        _id: '$botName',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]

  const botStatsData = readerlogUtils.aggregate(botStatsPipeline).catch(err => {
    adminApiLog.error(err)
    return false
  })
  promiseArray.push(botStatsData)

  // 新增：语言统计（仅统计 language 字段）
  const languageStatsPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: 'open',
        isBot: false,
        'data.extraInfo.language.language': {
          $exists: true,
          $ne: null,
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: '$data.extraInfo.language.language',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: { ...ippvSortRule }
    },
    {
      $limit: limit
    }
  ]

  const languageStatsData = readerlogUtils
    .aggregate(languageStatsPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })
  promiseArray.push(languageStatsData)

  // 新增：完整语言环境统计（language-script-region）
  const fullLocaleStatsPipeline = [
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: 'open',
        isBot: false,
        'data.extraInfo.language.language': {
          $exists: true,
          $ne: null,
          $ne: ''
        }
      }
    },
    {
      $project: {
        fullLocale: {
          $concat: [
            { $ifNull: ['$data.extraInfo.language.language', ''] },
            {
              $cond: [
                {
                  $and: [
                    {
                      $ne: [
                        { $ifNull: ['$data.extraInfo.language.script', ''] },
                        ''
                      ]
                    },
                    {
                      $ne: [
                        { $ifNull: ['$data.extraInfo.language.language', ''] },
                        ''
                      ]
                    }
                  ]
                },
                {
                  $concat: [
                    '-',
                    { $ifNull: ['$data.extraInfo.language.script', ''] }
                  ]
                },
                ''
              ]
            },
            {
              $cond: [
                {
                  $and: [
                    {
                      $ne: [
                        { $ifNull: ['$data.extraInfo.language.region', ''] },
                        ''
                      ]
                    },
                    {
                      $ne: [
                        { $ifNull: ['$data.extraInfo.language.language', ''] },
                        ''
                      ]
                    }
                  ]
                },
                {
                  $concat: [
                    '-',
                    { $ifNull: ['$data.extraInfo.language.region', ''] }
                  ]
                },
                ''
              ]
            }
          ]
        },
        ip: 1
      }
    },
    {
      $group: {
        _id: '$fullLocale',
        pvCount: { $sum: 1 },
        ips: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 1,
        pvCount: 1,
        ipCount: { $size: '$ips' }
      }
    },
    {
      $sort: { ...ippvSortRule }
    },
    {
      $limit: limit
    }
  ]

  const fullLocaleStatsData = readerlogUtils
    .aggregate(fullLocaleStatsPipeline)
    .catch(err => {
      adminApiLog.error(err)
      return false
    })
  promiseArray.push(fullLocaleStatsData)

  try {
    const [
      readReferrerData,
      readPostViewData,
      readPostLikeData,
      readPostShareData,
      readPostSharePlatformData,
      readPostListSortData,
      readPostListTagData,
      readPostListKeywordData,
      readPostListBangumiData,
      readPostListMovieData,
      readPostListBookData,
      readPostListGameData,
      readPostListMappointData,
      deviceAndLocationData,
      botStatsData, // 爬虫统计数据
      languageStatsData, // 语言统计数据
      fullLocaleStatsData // 完整语言环境统计数据
    ] = await Promise.all(promiseArray)

    if (
      !readReferrerData ||
      !readPostViewData ||
      !readPostLikeData ||
      !readPostShareData ||
      !readPostSharePlatformData ||
      !readPostListSortData ||
      !readPostListTagData ||
      !readPostListKeywordData ||
      !readPostListBangumiData ||
      !readPostListMovieData ||
      !readPostListBookData ||
      !readPostListGameData ||
      !readPostListMappointData ||
      !deviceAndLocationData ||
      !botStatsData ||
      !languageStatsData ||
      !fullLocaleStatsData
    ) {
      res.status(500).json({
        errors: [
          {
            message: '数据库查询错误'
          }
        ]
      })
      return
    }

    let sendData = {
      readReferrerData: readReferrerData,
      readPostViewData: readPostViewData,
      readPostLikeData: readPostLikeData,
      readPostShareData: readPostShareData,
      readPostSharePlatformData: readPostSharePlatformData,
      readPostListSortData: readPostListSortData,
      readPostListTagData: readPostListTagData,
      readPostListKeywordData: readPostListKeywordData,
      readPostListBangumiData: readPostListBangumiData,
      readPostListMovieData: readPostListMovieData,
      readPostListBookData: readPostListBookData,
      readPostListGameData: readPostListGameData,
      readPostListMappointData: readPostListMappointData,
      // 设备和地理位置统计数据
      browserStats: deviceAndLocationData[0].browserStats,
      osStats: deviceAndLocationData[0].osStats,
      countryStats: deviceAndLocationData[0].countryStats,
      regionStats: deviceAndLocationData[0].regionStats,
      // 爬虫统计数据
      botStats: botStatsData,
      // 语言统计数据
      languageStats: languageStatsData,
      fullLocaleStats: fullLocaleStatsData
    }

    // 发送响应
    res.send(sendData)
  } catch (error) {
    console.error(error)
    adminApiLog.error(error)
    res.status(500).json({
      errors: [
        {
          message: '服务器内部错误'
        }
      ]
    })
  }
}
