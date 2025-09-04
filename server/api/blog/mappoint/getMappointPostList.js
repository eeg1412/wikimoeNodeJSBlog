const mappointUtils = require('../../../mongodb/utils/mappoints')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const mongoose = require('mongoose')

module.exports = async function (req, res, next) {
  const id = req.query.id
  let { page } = req.query
  page = parseInt(page) || 1
  const size = 10 // 每页显示10条

  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }

  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }

  // 判断page是否为数字
  if (!utils.isNumber(page)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }
  // 使用聚合查询获取相关的文章
  const pipeline = [
    // 匹配条件：status为1且mappointList包含该地图点ID
    {
      $match: {
        status: 1,
        mappointList: new mongoose.Types.ObjectId(id)
      }
    },
    // 排序：按日期倒序
    {
      $sort: {
        date: -1,
        _id: -1
      }
    },
    // 分页
    {
      $skip: (page - 1) * size
    },
    {
      $limit: size
    },
    // 投影：只返回需要的字段
    {
      $project: {
        _id: 1,
        title: 1,
        date: 1,
        alias: 1,
        type: 1,
        status: 1,
        excerpt: {
          $cond: {
            if: { $eq: ['$type', 2] },
            then: '$excerpt',
            else: '$$REMOVE'
          }
        },
        // 只要第一张封面图片
        coverImage: {
          $arrayElemAt: ['$coverImages', 0]
        }
      }
    },
    // 获取 coverImage 的数据
    {
      $lookup: {
        from: 'attachments',
        localField: 'coverImage',
        foreignField: '_id',
        as: 'coverImage'
      }
    },
    {
      $unwind: {
        path: '$coverImage',
        preserveNullAndEmptyArrays: true // 可选：保留空数组和 null 值
      }
    }
  ]

  // 计算总数的聚合管道
  const countPipeline = [
    {
      $match: {
        status: 1,
        mappointList: new mongoose.Types.ObjectId(id)
      }
    },
    {
      $count: 'total'
    }
  ]

  try {
    // 执行聚合查询
    const [posts, countResult] = await Promise.all([
      postUtils.aggregate(pipeline),
      postUtils.aggregate(countPipeline)
    ])

    const total = countResult[0]?.total || 0

    res.send({
      list: posts,
      total: total,
      page: page,
      size: size
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '文章列表获取失败'
        }
      ]
    })
    userApiLog.error(`mappoint posts get fail, ${logErrorToText(err)}`)
  }
}
