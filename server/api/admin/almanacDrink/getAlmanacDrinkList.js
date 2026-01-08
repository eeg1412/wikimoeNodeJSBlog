const almanacDrinksUtils = require('../../../mongodb/utils/almanacDrinks')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    taxis: 1,
    _id: -1
  }
  almanacDrinksUtils
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
            message: '饮品列表获取失败'
          }
        ]
      })
      adminApiLog.error(`almanac drink list get fail, ${JSON.stringify(err)}`)
    })
}
