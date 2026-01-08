const almanacUtils = require('../../../mongodb/utils/almanacs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    // 排序
    taxis: 1,
    _id: -1
  }
  almanacUtils
    .findPage({}, sort)
    .then(data => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '老黄历列表获取失败'
          }
        ]
      })
      adminApiLog.error(`almanac list get fail, ${JSON.stringify(err)}`)
    })
}
