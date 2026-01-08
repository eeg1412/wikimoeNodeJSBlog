const almanacDrinksUtils = require('../../../mongodb/utils/almanacDrinks')
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

  almanacDrinksUtils
    .deleteOne({ _id: params.id })
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac drink delete success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '饮品删除失败'
          }
        ]
      })
      adminApiLog.error(`almanac drink delete fail, ${JSON.stringify(err)}`)
    })
}
