const almanacToolsUtils = require('../../../mongodb/utils/almanacTools')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.query
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

  almanacToolsUtils
    .deleteOne({ _id: params.id })
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac tool delete success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '工具删除失败'
          }
        ]
      })
      adminApiLog.error(`almanac tool delete fail, ${JSON.stringify(err)}`)
    })
}
