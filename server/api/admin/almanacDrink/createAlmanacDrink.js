const almanacDrinksUtils = require('../../../mongodb/utils/almanacDrinks')
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
      label: '饮品名称',
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  almanacDrinksUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac drink create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '饮品创建失败'
          }
        ]
      })
      adminApiLog.error(`almanac drink create fail, ${logErrorToText(err)}`)
    })
}
