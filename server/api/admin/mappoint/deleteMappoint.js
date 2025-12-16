const mappointUtils = require('../../../mongodb/utils/mappoints')
const postUtils = require('../../../mongodb/utils/posts')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const utils = require('../../../utils/utils')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({ errors: [{ message: 'id格式错误' }] })
    return
  }

  //  删除地点
  mappointUtils
    .deleteOne({ _id: id })
    .then(data => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败'
            }
          ]
        })
        return
      }

      // 删除文章中的tag
      postUtils
        .updateMany(
          { mappointList: id },
          {
            $pull: {
              mappointList: id
            }
          }
        )
        .then(postData => {
          console.log(postData)
          res.send({
            data: {
              message: '删除成功'
            }
          })
        })
        .catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '删除失败'
              }
            ]
          })
          adminApiLog.error(`mappoint delete fail, ${logErrorToText(err)}`)
        })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`mappoint delete fail, ${logErrorToText(err)}`)
    })
}
