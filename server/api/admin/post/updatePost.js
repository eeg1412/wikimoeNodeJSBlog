
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
  const id = req.body.id
  let { title, date, content, excerpt, alias, sort, tags, top, sortop, status, allowRemark, template, code, coverImages, bangumiList, gameList, bookList, postList, eventList, __v } = req.body
  // 校验id是否存在
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // 根据id查找文章
  const post = await postUtils.findOne({ _id: id }).catch((err) => {
    return null
  })
  if (!post) {
    res.status(404).json({
      errors: [{
        message: '文章不存在'
      }]
    })
    return
  }
  // 校验__v 是否对的上
  if (__v !== post.__v) {
    res.status(400).json({
      errors: [{
        message: '该文章已被其他用户修改，请刷新后重试'
      }]
    })
    return
  }

  // 用 validator.isMongoId 校验 bangumiList, gameList, bookList
  for (let i = 0; i < bangumiList.length; i++) {
    if (!validator.isMongoId(bangumiList[i])) {
      res.status(400).json({
        errors: [{
          message: 'bangumiList格式错误'
        }]
      })
      return
    }
  }
  for (let i = 0; i < gameList.length; i++) {
    if (!validator.isMongoId(gameList[i])) {
      res.status(400).json({
        errors: [{
          message: 'gameList格式错误'
        }]
      })
      return
    }
  }
  for (let i = 0; i < bookList.length; i++) {
    if (!validator.isMongoId(bookList[i])) {
      res.status(400).json({
        errors: [{
          message: 'bookList格式错误'
        }]
      })
      return
    }
  }
  for (let i = 0; i < postList.length; i++) {
    if (!validator.isMongoId(postList[i])) {
      res.status(400).json({
        errors: [{
          message: 'postList格式错误'
        }]
      })
      return
    }
  }
  for (let i = 0; i < eventList.length; i++) {
    if (!validator.isMongoId(eventList[i])) {
      res.status(400).json({
        errors: [{
          message: 'eventList格式错误'
        }]
      })
      return
    }
  }

  // 校验tags 
  if (!Array.isArray(tags)) {
    res.status(400).json({
      errors: [{
        message: 'tags必须是数组'
      }]
    })
    return
  }

  // 校验是否含有空内容
  for (let i = 0; i < tags.length; i++) {
    if (!tags[i]) {
      res.status(400).json({
        errors: [{
          message: 'tags格式错误'
        }]
      })
      return
    }
  }

  // 校验是否有重复
  const uniqueTags = new Set(tags)
  if (uniqueTags.size !== tags.length) {
    res.status(400).json({
      errors: [{
        message: 'tags不能重复'
      }]
    })
    return
  }


  // 1blog,2tweet,3page
  const type = post.type
  const params = {
    title: title,
    date: date,
    content: content,
    excerpt: excerpt,
    alias: alias,
    sort: sort,
    tags: tags,
    top: top,
    sortop: sortop,
    status: status,
    allowRemark: allowRemark,
    template: template,
    code: code,
    coverImages: coverImages,
    bangumiList: bangumiList,
    gameList: gameList,
    bookList: bookList,
    postList: postList,
    eventList: eventList,
    lastChangDate: new Date()
  }
  const rules = [
    {
      key: 'date',
      label: '发布日期',
      type: 'isISO8601',
    }
  ]
  if (sort) {
    rules.push({
      key: 'sort',
      label: '分类',
      type: 'isMongoId',
    })
  }
  const errors = utils.checkForm(params, rules)
  if (errors.length > 0) {
    res.status(400).json({
      errors: errors
    })
    return
  }
  // 校验coverImages 为mongodb的ObjectId
  const coverImages_ = coverImages || []
  const coverImagesIdArr = []
  for (let i = 0; i < coverImages_.length; i++) {
    const coverImageId = coverImages_[i];
    if (!validator.isMongoId(coverImageId)) {
      res.status(400).json({
        errors: [{
          message: 'coverImages格式错误'
        }]
      })
      return
    }
    coverImagesIdArr.push(coverImageId)
  }
  // 校验alias是否存在
  if (alias) {
    const aliasPost = await postUtils.findOne({
      alias: {
        $regex: new RegExp('^' + alias + '$', 'i')
      },
      // 排除自己
      _id: {
        $ne: id
      }
    }).catch((err) => {
      return 500
    })
    if (aliasPost) {
      res.status(400).json({
        errors: [{
          message: '别名已存在'
        }]
      })
      return
    } else if (aliasPost === 500) {
      res.status(500).json({
        errors: [{
          message: '服务器错误'
        }]
      })
      return
    }
  }

  // if (type === 2) {
  //   // tweet的处理
  //   // title 根据content，裁切前20个字符，后面加上...
  //   params.title = content || ''
  //   if (content.length > 20) {
  //     params.title = content.slice(0, 20) + '...'
  //   }
  // }
  // 后台拿到tags时判断是否是id，如果不是id，就创建tag，然后把tag的id放到tags里面，记得不要重复创建tag
  const tags_ = tags || []
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
  params.tags = tagsIdArr

  // 更新
  postUtils.updateOne({ _id: id, __v: __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`post update success`)
    // 新旧status不一样，更新缓存
    if (post.status !== status) {
      cacheDataUtils.getPostArchiveList()
    }
    rssToolUtils.reflushRSS()
    sitemapToolUtils.reflushSitemap()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新文章失败'
      }]
    })
    adminApiLog.error(`post update fail, ${logErrorToText(err)}`)
  })

}
