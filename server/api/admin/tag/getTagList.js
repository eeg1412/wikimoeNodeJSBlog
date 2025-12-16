const tagUtils = require('../../../mongodb/utils/tags')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')

module.exports = async function (req, res, next) {
  let { page, size, keyword, idList, shouldCount } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size
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
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({
      errors: queryErrors
    })
    return
  }
  const params = {}
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.tagname = new RegExp(keyword, 'i')
  }
  if (idList) {
    if (!Array.isArray(idList)) {
      idList = [idList]
    }
    // 校验idList是否为数组且是否为ObjectId
    for (let i = 0; i < idList.length; i++) {
      if (!utils.isObjectId(idList[i])) {
        res.status(400).json({
          errors: [
            {
              message: '参数错误'
            }
          ]
        })
        return
      }
      // idList[i] 转换为ObjectId
      idList[i] = new mongoose.Types.ObjectId(idList[i])
    }
    params._id = { $in: idList }
  }

  const sort = {
    lastusetime: -1,
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
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'tags',
          as: 'posts'
        }
      },
      // 添加文章数量字段
      {
        $addFields: {
          totalPostCount: { $size: '$posts' },
          publicPostCount: {
            $size: {
              $filter: {
                input: '$posts',
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
          posts: 0
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

  tagUtils
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
            message: '标签列表获取失败'
          }
        ]
      })
      adminApiLog.error(`tag list get fail, ${logErrorToText(err)}`)
    })
}
