const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')

module.exports = async function (req, res, next) {
  let { page, size, keyword, gamePlatform, status, playStatus, shouldCount } =
    req.query
  page = parseInt(page)
  size = parseInt(size)
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }
  const params = {}
  if (playStatus) {
    const playStatusList = [99, 1, 2, 3]
    const playStatusNumber = Number(playStatus)
    // 如果status在statusList中，就加入查询条件
    if (playStatusList.includes(playStatusNumber)) {
      switch (playStatusNumber) {
        case 99:
          params.giveUp = true
          break
        case 1:
          // 未开始：startTime和endTime都为空
          params.giveUp = { $ne: true }
          params.startTime = { $eq: null }
          params.endTime = { $eq: null }
          break
        case 2:
          // 进行中：startTime有值，endTime为空
          params.giveUp = { $ne: true }
          params.startTime = { $ne: null }
          params.endTime = { $eq: null }
          break
        case 3:
          // 已完成：startTime和endTime都有值
          params.giveUp = { $ne: true }
          params.startTime = { $ne: null }
          params.endTime = { $ne: null }
          break

        default:
          break
      }
    }
  }

  if (keyword) {
    keyword = String(keyword)
    // keyword去掉前后空格
    keyword = keyword?.trim()
    const keywordArray = keyword.split(' ')
    const regexArray = keywordArray.map(keyword => {
      const escapedKeyword = utils.escapeSpecialChars(keyword)
      const regex = new RegExp(escapedKeyword, 'i')
      return regex
    })
    // 检索title和excerpt
    params.$or = [
      {
        title: { $in: regexArray }
      },
      {
        label: { $in: regexArray }
      }
    ]
  }
  // 如果gamePlatform存在，就加入查询条件
  if (gamePlatform) {
    // gamePlatform 是数组，需要转换为ObjectId
    const gamePlatformIds = []
    for (let i = 0; i < gamePlatform.length; i++) {
      if (utils.isObjectId(gamePlatform[i])) {
        gamePlatformIds.push(new mongoose.Types.ObjectId(gamePlatform[i]))
      }
    }
    if (gamePlatformIds.length > 0) {
      params.gamePlatform = { $in: gamePlatformIds }
    }
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = Number(status)
  }

  const sort = {
    _id: -1
  }

  // 构建聚合管道
  const pipeline = [
    // 条件过滤
    {
      $match: params
    },
    // 查找 gamePlatform
    {
      $lookup: {
        from: 'gameplatforms',
        localField: 'gamePlatform',
        foreignField: '_id',
        as: 'gamePlatform'
      }
    },
    {
      $unwind: {
        path: '$gamePlatform',
        preserveNullAndEmptyArrays: true
      }
    },
    // 查找 screenshotAlbum
    {
      $lookup: {
        from: 'albums',
        localField: 'screenshotAlbum',
        foreignField: '_id',
        as: 'screenshotAlbum'
      }
    },
    {
      $unwind: {
        path: '$screenshotAlbum',
        preserveNullAndEmptyArrays: true
      }
    }
  ]

  if (shouldCount === '1') {
    pipeline.push(
      // 查找普通引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'gameList',
          as: 'normalPosts'
        }
      },
      // 查找内容引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'contentGameList',
          as: 'contentPosts'
        }
      },
      // 添加统计字段
      {
        $addFields: {
          totalNormalPostCount: { $size: '$normalPosts' },
          publicNormalPostCount: {
            $size: {
              $filter: {
                input: '$normalPosts',
                as: 'post',
                cond: { $eq: ['$$post.status', 1] }
              }
            }
          },
          totalContentPostCount: { $size: '$contentPosts' },
          publicContentPostCount: {
            $size: {
              $filter: {
                input: '$contentPosts',
                as: 'post',
                cond: { $eq: ['$$post.status', 1] }
              }
            }
          }
        }
      },
      // 移除posts字段
      {
        $project: {
          normalPosts: 0,
          contentPosts: 0
        }
      }
    )
  }

  pipeline.push(
    // 排序
    {
      $sort: sort
    },
    // 分页
    {
      $skip: (page - 1) * size
    },
    {
      $limit: size
    }
  )

  // 使用facet实现分页
  const aggregatePipeline = [
    {
      $facet: {
        // 获取分页数据
        list: pipeline,
        // 获取总数
        total: [
          {
            $match: params
          },
          {
            $count: 'count'
          }
        ]
      }
    }
  ]

  gameUtils
    .aggregate(aggregatePipeline)
    .then(result => {
      const data = {
        list: result[0].list,
        total: result[0].total[0]?.count || 0
      }
      res.send(data)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '游戏列表获取失败'
          }
        ]
      })
      adminApiLog.error(`game list get fail, ${logErrorToText(err)}`)
    })
}
