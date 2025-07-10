const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { page, id, sorttype } = req.query
  page = parseInt(page)
  const { siteCommentPageSize: size } = global.$globalConfig.commentSettings
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误',
        },
      ],
    })
    return
  }
  const uuid = req.headers['wmb-request-id']
  // 构建查询参数
  const params = {
    post: id,
    $or: [
      { status: 1 }, // 正常状态的评论
    ],
  }
  if (uuid) {
    params.$or.push({
      status: 0,
      uuid: uuid,
    })
  }
  let sort = {
    // top置顶
    top: -1,
    date: -1,
    _id: -1,
  }
  if (sorttype === 'like') {
    sort = {
      top: -1,
      likes: -1,
      _id: -1,
    }
  }
  commentUtils
    .findPage(params, sort, page, size, '-post')
    .then((data) => {
      const keys = [
        '_id',
        'avatar',
        'content',
        'date',
        'nickname',
        'url',
        'likes',
        'isAdmin',
        'parent',
        'parentId',
        'top',
        'status',
      ]

      const list = data.list.map((item, index) => {
        const jsonItem = item.toJSON()

        // 设置parentId
        jsonItem.parentId = item.populated('parent')

        // 处理头像和用户信息
        if (jsonItem.email) {
          jsonItem.avatar = utils.md5hex(jsonItem.email)
        }
        if (jsonItem.user) {
          jsonItem.avatar = jsonItem.user.photo
          jsonItem.nickname = jsonItem.user.nickname
          jsonItem.isAdmin = true
        } else {
          jsonItem.isAdmin = false
        }

        // 处理父评论
        if (jsonItem.parent) {
          if (jsonItem.parent.status !== 1) {
            jsonItem.parent = null
          }
          if (jsonItem.parent?.user) {
            jsonItem.parent.nickname = jsonItem.parent.user.nickname
          }
          delete jsonItem.parent.user
        }

        // 只保留需要的key
        return Object.fromEntries(
          Object.entries(jsonItem).filter(([key]) => keys.includes(key)),
        )
      })
      res.send({
        list: list,
        total: data.total,
        size: size,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '评论列表获取失败',
          },
        ],
      })
      userApiLog.error(`comment list get fail, ${logErrorToText(err)}`)
    })
}
