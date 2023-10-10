const chalk = require('chalk')
const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const adminData = {
    nickname: req.admin.nickname,
    id: req.admin._id,
    role: req.admin.role,
  }
  res.send({
    data: adminData
  })
}
