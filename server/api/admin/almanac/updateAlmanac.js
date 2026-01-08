const almanacUtils = require('../../../mongodb/utils/almanacs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { _id, name, good, bad, weekend, effectiveDate, taxis, status } = req.body
  // 校验格式
  const params = {
    _id: _id || '',
    name: name || '',
    good: good || '',
    bad: bad || '',
    weekend: weekend || false,
    effectiveDate: effectiveDate || null,
    taxis: taxis || 0,
    status: status !== undefined ? status : 1
  }
  const rule = [
    {
      key: '_id',
      label: 'ID',
      strict: true,
      strictType: 'string'
    },
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
  // update
  const updateParams = {
    name: params.name,
    good: params.good,
    bad: params.bad,
    weekend: params.weekend,
    effectiveDate: params.effectiveDate,
    taxis: params.taxis,
    status: params.status
  }
  almanacUtils
    .updateOne({ _id: params._id }, updateParams)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '老黄历更新失败'
          }
        ]
      })
      adminApiLog.error(`almanac update fail, ${JSON.stringify(err)}`)
    })
}
