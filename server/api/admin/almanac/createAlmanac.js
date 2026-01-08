const almanacUtils = require('../../../mongodb/utils/almanacs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name, good, bad, weekend, effectiveDate, taxis } = req.body
  // 校验格式
  const params = {
    name: name || '',
    good: good || '',
    bad: bad || '',
    weekend: weekend || false,
    effectiveDate: effectiveDate || null,
    taxis: taxis || 0
  }
  const rule = [
    {
      key: 'name',
      label: '项目名称',
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  almanacUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '老黄历创建失败'
          }
        ]
      })
      adminApiLog.error(`almanac create fail, ${logErrorToText(err)}`)
    })
}
