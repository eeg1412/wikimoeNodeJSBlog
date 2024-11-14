
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const tagUtils = require('../../../mongodb/utils/tags')
const adminApiLog = log4js.getLogger('adminApi')
const validator = require('validator')
const cacheDataUtils = require('../../../config/cacheData')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')

module.exports = async function (req, res, next) {
  // - title	标题字段
  // - date	日期字段
  // - content	内容字段
  // - excerpt	摘要字段
  // - alias	别名字段
  // - sort	分类
  // - type	类型：1blog,2tweet,3page
  // - tags	标签字段[]

  // - top	是否置顶字段
  // - sortop	是否排序置顶字段
  // - status	状态字段：0草稿，1发布，99回收站
  // - allowRemark	是否允许评论字段
  // - template	模板字段
  // - code	文章插入的Code字段
  // - coverImages  博客时是封面图片字段，页面时是页面图片字段
  // - __v  版本号字段

  // 输入参数
  // idList 文章id列表
  // action 操作类型
  // sortId 分类id
  // tagIdList 标签id列表
  // status 状态


  const idList = req.body.idList
  const action = req.body.action
  let sortId = req.body.sortId || null
  const tagIdList = req.body.tagIdList || []
  const status = req.body.status

  if (!idList || !Array.isArray(idList) || idList.length === 0) {
    res.status(400).json({
      errors: [{
        message: 'idList不能为空'
      }]
    })
    return false
  }
  // 检验是否存在action
  if (!action) {
    res.status(400).json({
      errors: [{
        message: 'action不能为空'
      }]
    })
    return false
  }
  // 校验idList的每个id是否合法
  // utils.isObjectId
  idList.forEach(id => {
    if (!validator.isMongoId(id)) {
      res.status(400).json({
        errors: [{
          message: 'id参数有误'
        }]
      })
      return false
    }
  })

  // 批量操作--更改分类
  const changeSort = async function () {
    // 检验sortId是否合法
    if (sortId) {
      if (!validator.isMongoId(sortId)) {
        res.status(400).json({
          errors: [{
            message: 'sortId参数有误'
          }]
        })
        return false
      }
    } else {
      sortId = null
    }
    // 更改分类
    const query = {
      _id: {
        $in: idList
      }
    }
    const parmas = {
      sort: sortId
    }
    try {
      const result = await postUtils.updateMany(query, parmas)
      return result
    } catch (err) {
      adminApiLog.error(err)
      res.status(500).json({
        errors: [{
          message: '更改分类失败'
        }]
      })
      return false
    }
  }

  // 批量操作--增加标签
  const addTag = async function () {
    const tags_ = tagIdList || []
    let tagsIdArr = []
    for await (const tagId of tags_) {
      if (!validator.isMongoId(tagId)) {
        const tagname = utils.replaceSpacesWithUnderscores(tagId)
        // 不是id，创建tag
        // 校验tagname是否存在
        let tag = await tagUtils.findOne({ tagname: tagname }).catch((err) => {
          return null
        })
        if (!tag) {
          tag = await tagUtils.save({
            tagname: tagname
          }).catch((err) => {
            return false
          })
        }

        if (tag) {
          tagsIdArr.push(tag._id)
        }
      } else {
        tagsIdArr.push(tagId)
      }
    }

    // tagsIdArr 去重
    tagsIdArr = tagsIdArr.filter((elem, index, self) => self.indexOf(elem) === index)

    const resultList = []
    // 遍历tagsIdArr
    for await (const tagId of tagsIdArr) {
      const query = {
        _id: {
          $in: idList
        },
        tags: {
          $ne: tagId
        }
      }
      const parmas = {
        $addToSet: {
          tags: tagId
        }
      }
      try {
        const result = await postUtils.updateMany(query, parmas)
        resultList.push(result)
      } catch (err) {
        adminApiLog.error(err)
        res.status(500).json({
          errors: [{
            message: '增加标签失败'
          }]
        })
        return false
      }
    }
    return resultList

  }

  // 批量操作--设置标签
  const setTag = async function () {
    const tags_ = tagIdList || []
    let tagsIdArr = []
    for await (const tagId of tags_) {
      if (!validator.isMongoId(tagId)) {
        const tagname = utils.replaceSpacesWithUnderscores(tagId)
        // 不是id，创建tag
        // 校验tagname是否存在
        let tag = await tagUtils.findOne({ tagname: tagname }).catch((err) => {
          return null
        })
        if (!tag) {
          tag = await tagUtils.save({
            tagname: tagname
          }).catch((err) => {
            return false
          })
        }

        if (tag) {
          tagsIdArr.push(tag._id)
        }
      } else {
        tagsIdArr.push(tagId)
      }
    }

    // tagsIdArr 去重
    tagsIdArr = tagsIdArr.filter((elem, index, self) => self.indexOf(elem) === index)

    const query = {
      _id: {
        $in: idList
      }
    }
    const parmas = {
      tags: tagsIdArr
    }
    try {
      const result = await postUtils.updateMany(query, parmas)
      return result
    } catch (err) {
      adminApiLog.error(err)
      res.status(500).json({
        errors: [{
          message: '增加标签失败'
        }]
      })
      return false
    }
  }

  // 批量操作--删除标签
  const removeTag = async function () {
    // 校验tagIdList的每个id是否合法
    tagIdList.forEach(id => {
      if (!validator.isMongoId(id)) {
        res.status(400).json({
          errors: [{
            message: 'tagId参数有误'
          }]
        })
        return false
      }
    })
    const query = {
      _id: {
        $in: idList
      }
    }
    const parmas = {
      $pull: {
        tags: {
          $in: tagIdList
        }
      }
    }
    try {
      const result = await postUtils.updateMany(query, parmas)
      return result
    } catch (err) {
      adminApiLog.error(err)
      res.status(500).json({
        errors: [{
          message: '删除标签失败'
        }]
      })
      return false
    }
  }

  // 批量操作--更改状态
  const changeStatus = async function () {
    // - status	状态字段：0草稿，1发布
    // 检验status是否合法
    if (![0, 1].includes(status)) {
      res.status(400).json({
        errors: [{
          message: 'status参数有误'
        }]
      })
      return false
    }
    // 更改状态
    const query = {
      _id: {
        $in: idList
      }
    }
    const parmas = {
      status: status
    }
    try {
      const result = await postUtils.updateMany(query, parmas)
      return result
    } catch (err) {
      adminApiLog.error(err)
      res.status(500).json({
        errors: [{
          message: '更改状态失败'
        }]
      })
      return false
    }
  }

  // 批量操作--删除
  const deletePost = async function () {
    const query = {
      _id: {
        $in: idList
      }
    }
    try {
      const result = await postUtils.deleteMany(query)
      return result
    }
    catch (err) {
      adminApiLog.error(err)
      res.status(500).json({
        errors: [{
          message: '删除文章失败'
        }]
      })
      return false
    }
  }





  try {
    let result = null
    switch (action) {
      case 'changeSort':
        result = await changeSort()
        break
      case 'addTag':
        result = await addTag()
        break
      case 'setTag':
        result = await setTag()
        break
      case 'removeTag':
        result = await removeTag()
        break
      case 'changeStatus':
        result = await changeStatus()
        break
      case 'delete':
        result = await deletePost()
        break
      default:
        res.status(400).json({
          errors: [{
            message: 'action参数有误'
          }]
        })
        result = false
        return
    }

    if (result) {
      res.send({
        data: result
      })
      adminApiLog.info(`post batch update success`)
      cacheDataUtils.getPostArchiveList()
      rssToolUtils.reflushRSS()
      sitemapToolUtils.reflushSitemap()
    }
  } catch (error) {
    res.status(400).json({
      errors: [{
        message: '批量更改文章失败'
      }]
    })
    adminApiLog.error(`post batch update fail, ${logErrorToText(err)}`)
  }



}
