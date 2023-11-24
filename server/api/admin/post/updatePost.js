
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const tagUtils = require('../../../mongodb/utils/tags')
const adminApiLog = log4js.getLogger('adminApi')
const validator = require('validator')

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
  let { title, date, content, excerpt, alias, sort, tags, top, sortop, status, allowRemark, template, code, coverImages, __v } = req.body
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
    const aliasPost = await postUtils.findOne({ alias: alias }).catch((err) => {
      return 500
    })
    if (aliasPost && aliasPost._id.toString() !== id) {
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
      // 不是id，创建tag
      // 校验tagname是否存在
      let tag = await tagUtils.findOne({ tagname: tagId }).catch((err) => {
        return null
      })
      if (!tag) {
        tag = await tagUtils.save({
          tagname: tagId
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
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '更新文章失败'
      }]
    })
    adminApiLog.error(`post update fail, ${JSON.stringify(err)}`)
  })

}
