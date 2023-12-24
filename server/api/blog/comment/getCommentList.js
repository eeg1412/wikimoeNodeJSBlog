const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, id } = req.query
  page = parseInt(page)
  const { siteCommentPageSize: size, } = global.$globalConfig.commentSettings
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  const params = {
    status: 1,
    post: id
  }
  const sort = {
    // top置顶
    top: -1,
    date: -1
  }
  commentUtils.findPage(params, sort, page, size).then((data) => {
    // 返回格式list,total
    const list = JSON.parse(JSON.stringify(data.list))
    // 需要获取的key数组
    const keys = ['_id', 'avatar', 'content', 'date', 'nickname', 'url', 'post', 'likes', 'isAdmin', 'parent', 'top']
    // 将list的email字段替换为gravatar头像
    list.forEach((item) => {
      const email = item.email || item.nickname
      if (email) {
        item.avatar = utils.md5hex(email)
      }
      if (item.user) {
        item.avatar = item.user.photo
        item.nickname = item.user.nickname
        item.isAdmin = true
      } else {
        item.isAdmin = false
      }
      // 判断parent是status是否为1,如果不是parent的content设置为 该评论咱不可见
      if (item.parent && item.parent.status !== 1) {
        item.parent.content = '啊呀！？这个评论怎么不见了！？难道是那个坏坏的魔法师把它删掉了！？'
      }
      // 只保留需要的key
      Object.keys(item).forEach((key) => {
        if (!keys.includes(key)) {
          delete item[key]
        }
      })
    })
    res.send({
      list: list,
      total: data.total,
      size: size,
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '评论列表获取失败'
      }]
    })
    userApiLog.error(`comment list get fail, ${JSON.stringify(err)}`)
  })
}
