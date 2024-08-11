const linkUtils = require('../../../mongodb/utils/links')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const params = {
    status: 1
  }
  const sort = {
    taxis: 1,
    _id: -1
  }
  linkUtils.find(params, sort).then((data) => {
    // 返回格式list,total
    res.send({
      list: data
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '友链列表获取失败'
      }]
    })
    userApiLog.error(`link list get fail, ${JSON.stringify(err)
      }`)
  })
}
