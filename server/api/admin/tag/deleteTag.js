const tagUtils = require('../../../mongodb/utils/tags')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

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
  //  删除分类
  tagUtils
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
      // 删除文章中的tag
      postUtils
        .updateMany(
          { tags: id },
          {
            $pull: {
              tags: id,
            },
          },
        )
        .then((postData) => {
          // console.log(postData)
          res.send({
            data: {
              message: '删除成功',
            },
          })
        })
        .catch((err) => {
          res.status(400).json({
            errors: [
              {
                message: '删除失败',
              },
            ],
          })
          adminApiLog.error(`tag delete fail, ${logErrorToText(err)}`)
        })
      // utils.reflushBlogCache()
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败',
          },
        ],
      })
      adminApiLog.error(`tag delete fail, ${logErrorToText(err)}`)
    })
}
