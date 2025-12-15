const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, year, season, status, shouldCount } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size,
    keyword,
    year,
    season,
    status
  }
  const queryRule = [
    {
      key: 'page',
      label: '页数',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'size',
      label: '每页数量',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'keyword',
      label: '关键词',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'year',
      label: '年份',
      type: 'isInt',
      required: false
    },
    {
      key: 'season',
      label: '季度',
      type: 'isInt',
      required: false
    },
    {
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: false
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({ errors: queryErrors })
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
  // 如果year存在，就加入查询条件
  if (year) {
    params.year = Number(year)
  }
  // 如果season存在，就加入查询条件
  if (season) {
    params.season = Number(season)
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
          foreignField: 'bangumiList',
          as: 'normalPosts'
        }
      },
      // 查找内容引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'contentBangumiList',
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

  bangumiUtils
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
            message: '番剧列表获取失败'
          }
        ]
      })
      adminApiLog.error(`bangumi list get fail, ${logErrorToText(err)}`)
    })
}
