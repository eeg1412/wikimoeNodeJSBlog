const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // bookname	String	是	否	无	书籍名称
  const { bookname, id, __v } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    bookname: bookname,
  }
  const rule = [
    {
      key: 'bookname',
      label: '书籍名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  bookUtils.updateOne({ _id: id, __v }, params).then((data) => {
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
    adminApiLog.info(`book update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '书籍更新失败'
      }]
    })
    adminApiLog.error(`book update fail, ${logErrorToText(err)}`)
  })
}
