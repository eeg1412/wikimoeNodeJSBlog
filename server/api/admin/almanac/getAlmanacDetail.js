const almanacUtils = require('../../../mongodb/utils/almanacs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.query
  // 校验格式
  const params = {
    id: id || ''
  }
  const rule = [
    {
      key: 'id',
      label: 'ID',
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // find
  almanacUtils
    .findOne({ _id: params.id })
    .then(data => {
      res.send({
        data: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '老黄历获取失败'
          }
        ]
      })
      adminApiLog.error(`almanac get fail, ${JSON.stringify(err)}`)
    })
}
