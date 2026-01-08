const almanacDrinksUtils = require('../../../mongodb/utils/almanacDrinks')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { _id, name, status } = req.body
  const params = {
    _id: _id || '',
    name: name || '',
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

  const updateParams = {
    name: params.name,
    status: params.status
  }
  almanacDrinksUtils
    .updateOne({ _id: params._id }, updateParams)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac drink update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '饮品更新失败'
          }
        ]
      })
      adminApiLog.error(`almanac drink update fail, ${JSON.stringify(err)}`)
    })
}
