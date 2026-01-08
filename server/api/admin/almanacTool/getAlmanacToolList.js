const almanacToolsUtils = require('../../../mongodb/utils/almanacTools')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    taxis: 1,
    _id: -1
  }
  almanacToolsUtils
    .findPage({}, sort)
    .then(data => {
      res.send({
        list: data.list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '工具列表获取失败'
          }
        ]
      })
      adminApiLog.error(`almanac tool list get fail, ${JSON.stringify(err)}`)
    })
}
