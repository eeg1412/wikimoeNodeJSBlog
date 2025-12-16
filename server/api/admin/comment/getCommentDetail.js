const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }
  // findOne
  commentUtils
    .findOne({ _id: id })
    .then(data => {
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '评论不存在'
            }
          ]
        })
        return
      }
      const parentId = data.populated('parent')
      const newData = data.toJSON()
      newData.parentId = parentId
      res.send({
        data: newData
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '评论详情获取失败'
          }
        ]
      })
      adminApiLog.error(`comment detail get fail, ${logErrorToText(err)}`)
    })
}
