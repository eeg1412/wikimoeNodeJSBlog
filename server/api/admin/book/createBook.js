const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  const {  } = req.body
  // 校验格式
  const params = {
  }
  const rule = [

  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  bookUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`book create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '书籍创建失败'
      }]
    })
    adminApiLog.error(`book create fail, ${logErrorToText(err)}`)
  })

}
