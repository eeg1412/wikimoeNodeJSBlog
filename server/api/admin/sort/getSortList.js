
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { shouldCount } = req.query
  const params = {}
  const sort = { taxis: 1 }
  // 构建聚合管道
  const pipeline = [
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
          foreignField: 'sort',
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
    }
  )

  sortUtils.aggregate(pipeline).then((data) => {
    // 生成树形结构
    const treeData = utils.generateTreeData(data)
    res.send({
      data: treeData
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '分类列表获取失败'
      }]
    })
    adminApiLog.error(`sort list get fail, ${logErrorToText(err)}`)
  })
}
