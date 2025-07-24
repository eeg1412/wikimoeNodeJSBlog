const movieUtils = require('../../../mongodb/utils/movies')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, status, shouldCount } = req.query
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
  // 如果keyword存在，就加入查询条件
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
    }
  ]

  if (shouldCount === '1') {
    pipeline.push(
      // 查找普通引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'movieList',
          as: 'normalPosts'
        }
      },
      // 查找内容引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'contentMovieList',
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

  movieUtils
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
            message: '电影列表获取失败'
          }
        ]
      })
      adminApiLog.error(`movie list get fail, ${logErrorToText(err)}`)
    })
}
