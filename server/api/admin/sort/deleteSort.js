const chalk = require('chalk')
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // TODO:分类下有文章时，不允许删除
  res.status(400).json({
    errors: [{
      message: 'TODO:分类下有文章时，不允许删除'
    }]
  })
  return
  //  删除分类
  sortUtils.deleteOne({ _id: id }).then((data) => {
    if (data.deletedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '删除失败'
        }]
      })
      return
    }
    res.send({
      data: {
        message: '删除成功'
      }
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '删除失败'
      }]
    })
    adminApiLog.error(`sort delete fail, ${JSON.stringify(err)}`)
  })
}
