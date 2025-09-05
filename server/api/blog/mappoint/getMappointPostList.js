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
  // 使用聚合查询同时获取文章列表和总数
  const pipeline = [
    // 匹配条件：status为1且mappointList包含该地图点ID
    {
      $match: {
        status: 1,
        mappointList: new mongoose.Types.ObjectId(id)
      }
    },
    // 使用 $facet 同时获取数据和总数
    {
      $facet: {
        // 获取文章列表
        data: [
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
        ],
        // 获取总数
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]

  try {
    // 执行聚合查询
    const result = await postUtils.aggregate(pipeline)

    const posts = result[0]?.data || []
    const total = result[0]?.totalCount[0]?.count || 0

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
