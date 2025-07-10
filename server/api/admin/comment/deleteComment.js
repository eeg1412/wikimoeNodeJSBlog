const { cache } = require('sharp')
const commentUtils = require('../../../mongodb/utils/comments')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空',
        },
      ],
    })
    return
  }
  // 查询评论
  const commentInfo = await commentUtils.findOne({ _id: id })
  if (!commentInfo) {
    res.status(400).json({
      errors: [
        {
          message: '评论不存在',
        },
      ],
    })
    return
  }
  //  删除评论
  commentUtils
    .deleteOne({ _id: id })
    .then((data) => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败',
            },
          ],
        })
        return
      }
      res.send({
        data: {
          message: '删除成功',
        },
      })
      // 记录
      adminApiLog.info(`comment delete success`)
      // 更新文章评论数
      // 如果commentInfo的status为1，则更新文章评论数
      if (commentInfo.status === 1) {
        postUtils.updateOne({ _id: commentInfo.post }, { $inc: { comnum: -1 } })
        cacheDataUtils.getCommentList()
        // utils.reflushBlogCache()
      }
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败',
          },
        ],
      })
      adminApiLog.error(`comment delete fail, ${logErrorToText(err)}`)
    })
}
