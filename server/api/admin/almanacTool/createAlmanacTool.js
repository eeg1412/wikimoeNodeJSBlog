const almanacToolsUtils = require('../../../mongodb/utils/almanacTools')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name } = req.body
  const params = {
    name: name || ''
  }
  const rule = [
    {
      key: 'name',
      label: '工具名称',
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  almanacToolsUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac tool create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '工具创建失败'
          }
        ]
      })
      adminApiLog.error(`almanac tool create fail, ${logErrorToText(err)}`)
    })
}
