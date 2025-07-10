const booktypeUtils = require('../../../mongodb/utils/booktypes')
const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
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
  // 查看对应书籍数量
  const bookCount = await bookUtils.count({ booktype: id })
  if (bookCount > 0) {
    res.status(400).json({
      errors: [
        {
          message: '该类型下有书籍，不能删除'
        }
      ]
    })
    return
  }
  //  删除书籍类型
  booktypeUtils
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
      adminApiLog.error(`booktype delete fail, ${logErrorToText(err)}`)
    })
}
