const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    // 排序
    taxis: 1,
    _id: -1,
  }
  bannerUtils
    .findPage({}, sort)
    .then((data) => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '横幅列表获取失败',
          },
        ],
      })
      adminApiLog.error(`banner list get fail, ${JSON.stringify(err)}`)
    })
}
