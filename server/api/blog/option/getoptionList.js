const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  res.send({
    data: {
      ...global.$globalConfig.siteSettings,
      ...global.$globalConfig.commentSettings
    }
  })
}
