
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  const type = req.query.type
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  const params = {
    status: 1,
  }
  if (type && Array.isArray(type) && type.length > 0) {
    // type是数组
    // 将type转换为数字
    let newType = type.map(Number);
    params.type = {
      $in: newType
    }
  }
  // 判断id是否是ObjectId
  if (utils.isObjectId(id)) {
    // 根据id查询
    params._id = id
  } else {
    // 根据alias查询
    params.alias = id
  }
  // findOne
  postUtils.findOne(params, undefined, { authorFilter: 'nickname _id photo description cover' }).then(async (data) => {
    if (!data) {
      res.status(404).json({
        errors: [{
          message: '文章不存在'
        }]
      })
      userApiLog.error(`post detail get fail, 文章不存在, id: ${id}`)
      return
    }
    let postRecommendations = []
    const getPostRecommendationsPostTypes = [1, 2]
    const postRecommendationsCount = 2
    if (getPostRecommendationsPostTypes.includes(data.type) && data.postList.length === 0 && postRecommendationsCount > 0) {
      // 博文的情况下，获取推荐文章
      const sort = data.sort?._id
      const tags = data.tags.map(item => item._id)
      const match = {
        $match: {
          status: 1,
          type: 1,
          _id: { $ne: data._id },
          $or: [
            { tags: { $in: tags } }
          ]
        }
      }
      if (sort) {
        match.$match.$or.push({ sort: sort })
      }
      await postUtils.aggregate([
        match,
        { $sample: { size: postRecommendationsCount } },
        // 如果有coverImages，只要第一个coverImages
        {
          $project: {
            title: 1,
            alias: 1,
            coverImages: { $slice: ['$coverImages', 1] }
          }
        },
        // lookup
        {
          $lookup: {
            from: 'attachments',
            localField: 'coverImages',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  filepath: 1,
                  mimetype: 1,
                  thumfor: 1,
                }
              },
            ],
            as: 'coverImages'
          }
        },
      ])
        .then(posts => {
          console.log(posts);
          postRecommendations = posts
        })
        .catch(err => {
          userApiLog.error(`post post recommendations get fail, ${logErrorToText(err)}`)
        });
    }
    res.send({
      data: data,
      postRecommendations: postRecommendations
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '文章详情获取失败'
      }]
    })
    userApiLog.error(`post detail get fail, ${logErrorToText(err)}`)
  })
}
