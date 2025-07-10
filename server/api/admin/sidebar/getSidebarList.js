const sidebarUtils = require('../../../mongodb/utils/sidebars')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    // 排序
    taxis: 1,
    // id
    _id: -1,
  }
  sidebarUtils
    .find({}, sort)
    .then((data) => {
      // 返回格式list,total
      res.send({
        list: data,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '侧边栏列表获取失败',
          },
        ],
      })
      adminApiLog.error(`sidebar list get fail, ${JSON.stringify(err)}`)
    })
}
