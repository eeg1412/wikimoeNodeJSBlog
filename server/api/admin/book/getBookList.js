const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')

module.exports = async function (req, res, next) {
  let { page, size, keyword, booktype, status, readStatus, shouldCount } =
    req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size,
    keyword,
    status,
    readStatus
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
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: false
    },
    {
      key: 'readStatus',
      label: '阅读状态',
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
    keyword = utils.escapeSpecialChars(keyword)
    params.title = new RegExp(keyword, 'i')
  }
  // 如果booktype存在，就加入查询条件
  if (booktype) {
    // booktype 是数组，需要转换为ObjectId
    const booktypeIds = []
    for (let i = 0; i < booktype.length; i++) {
      if (utils.isObjectId(booktype[i])) {
        booktypeIds.push(new mongoose.Types.ObjectId(booktype[i]))
      }
    }
    if (booktypeIds.length > 0) {
      params.booktype = { $in: booktypeIds }
    }
  }
  // 如果status存在，就加入查询条件
  if (status) {
    params.status = Number(status)
  }

  if (readStatus) {
    const readStatusList = [99, 1, 2, 3]
    const readStatusNumber = Number(readStatus)
    // 如果status在statusList中，就加入查询条件
    if (readStatusList.includes(readStatusNumber)) {
      switch (readStatusNumber) {
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

  const sort = {
    _id: -1
  }

  // 构建聚合管道
  const pipeline = [
    // 条件过滤
    {
      $match: params
    },
    // 查找 booktype
    {
      $lookup: {
        from: 'booktypes',
        localField: 'booktype',
        foreignField: '_id',
        as: 'booktype'
      }
    },
    {
      $unwind: {
        path: '$booktype',
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
          foreignField: 'bookList',
          as: 'normalPosts'
        }
      },
      // 查找内容引用的文章
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'contentBookList',
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

  bookUtils
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
            message: '书籍列表获取失败'
          }
        ]
      })
      adminApiLog.error(`book list get fail, ${logErrorToText(err)}`)
    })
}
