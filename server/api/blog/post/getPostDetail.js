const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const { ObjectId } = require('mongodb')

module.exports = async function (req, res, next) {
  const id = req.query.id
  const type = req.query.type
  const randompost = req.query.randompost
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
  const params = {
    status: 1
  }
  if (type && Array.isArray(type) && type.length > 0) {
    // type是数组
    // 将type转换为数字
    let newType = type.map(Number)
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
  postUtils
    .findOne(params, undefined, {
      authorFilter: 'nickname _id photo description cover',
      voteFliter:
        '_id endTime maxSelect showResultAfter title options.title options._id'
    })
    .then(async data => {
      if (!data) {
        res.status(404).json({
          errors: [
            {
              message: '文章不存在'
            }
          ]
        })
        userApiLog.error(`post detail get fail, 文章不存在, id: ${id}`)
        return
      }
      const jsonData = data.toJSON()
      const type = jsonData.type
      const sitePostRandomSimilarCount =
        global.$globalConfig?.sitePostSettings?.sitePostRandomSimilarCount || 0
      const sitePostRandomSimilarRange =
        global.$globalConfig?.sitePostSettings?.sitePostRandomSimilarRange || []
      const findType = []
      // 遍历sitePostRandomSimilarRange，如果有'1',添加1，如果有'2',添加2
      sitePostRandomSimilarRange.forEach(item => {
        switch (item) {
          case '1':
            findType.push(1)
            break
          case '2':
            findType.push(2)
            break
          // 如果有其他情况，可以继续添加 case
          default:
            break
        }
      })
      const sitePostRandomSimilarShowRange =
        global.$globalConfig?.sitePostSettings.sitePostRandomSimilarShowRange ||
        []
      // 判断sitePostRandomSimilarShowRange是否包含type其中sitePostRandomSimilarShowRange是字符串数组，type是数字
      const isShow = sitePostRandomSimilarShowRange.includes(String(type))
      if (
        randompost === '1' &&
        sitePostRandomSimilarCount > 0 &&
        findType.length > 0 &&
        isShow
      ) {
        const sortList = []
        const tagList = []
        // 处理分类
        const sortId = jsonData.sort?._id
        if (sortId) {
          sortList.push(sortId)
          const sortCache = global.$cacheData.sortList || []
          // 遍历sortCache
          const sortCacheItem = sortCache.find(
            item => String(item._id) === String(sortId)
          )
          if (
            sortCacheItem &&
            sortCacheItem.children &&
            sortCacheItem.children.length > 0
          ) {
            // 说明是父级，需要看有没有children
            sortList.push(...sortCacheItem.children.map(item => item._id))
          }
        }
        // 处理标签
        if (jsonData.tags && jsonData.tags.length > 0) {
          jsonData.tags.forEach(tag => {
            tagList.push(tag._id)
          })
        }
        // 如果sortList或tagList有数据，则进入随机查询
        if (sortList.length > 0 || tagList.length > 0) {
          const idSet = new Set()
          const nePostIdList = [jsonData._id]
          idSet.add(jsonData._id.toString())
          // 如果存在postList，则将postList的id加入nePostIdList
          if (jsonData.postList && jsonData.postList.length > 0) {
            jsonData.postList.forEach(post => {
              const strId = post._id.toString()
              if (!idSet.has(strId)) {
                idSet.add(strId)
                nePostIdList.push(post._id)
              }
            })
          }
          // 如果存在contentPostList，则将contentPostList的id加入nePostIdList
          if (jsonData.contentPostList && jsonData.contentPostList.length > 0) {
            jsonData.contentPostList.forEach(post => {
              const strId = post._id.toString()
              if (!idSet.has(strId)) {
                idSet.add(strId)
                nePostIdList.push(post._id)
              }
            })
          }

          // 如果存在tweetList，则将tweetList的id加入nePostIdList
          if (jsonData.tweetList && jsonData.tweetList.length > 0) {
            jsonData.tweetList.forEach(tweet => {
              const strId = tweet._id.toString()
              if (!idSet.has(strId)) {
                idSet.add(strId)
                nePostIdList.push(tweet._id)
              }
            })
          }
          // 如果存在contentTweetList，则将contentTweetList的id加入nePostIdList
          if (
            jsonData.contentTweetList &&
            jsonData.contentTweetList.length > 0
          ) {
            jsonData.contentTweetList.forEach(tweet => {
              const strId = tweet._id.toString()
              if (!idSet.has(strId)) {
                idSet.add(strId)
                nePostIdList.push(tweet._id)
              }
            })
          }

          // 开始聚合查询
          const randomPostList = await postUtils.aggregate([
            {
              $match: {
                status: 1,
                _id: {
                  $nin: nePostIdList
                },
                type: {
                  $in: findType
                },
                $or: [
                  {
                    sort: {
                      $in: sortList
                    }
                  },
                  {
                    tags: {
                      $in: tagList
                    }
                  }
                ]
              }
            },
            {
              $sample: {
                size: sitePostRandomSimilarCount
              }
            },
            // 按照date和_id排序
            {
              $sort: {
                date: -1,
                _id: -1
              }
            },
            // 获取字段 title date excerpt alias type status
            {
              $project: {
                title: 1,
                date: 1,
                excerpt: 1,
                alias: 1,
                type: 1,
                status: 1,
                // 只要第一张cover
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
          ])
          if (randomPostList && randomPostList.length > 0) {
            jsonData.randomPostList = randomPostList
          }
        }
      }
      res.send({
        data: jsonData
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '文章详情获取失败'
          }
        ]
      })
      userApiLog.error(`post detail get fail, ${logErrorToText(err)}`)
    })
}
