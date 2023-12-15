const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  if (!global.$globalConfig?.siteSettings || !global.$globalConfig?.commentSettings) {
    // 400
    res.status(400).json({
      errors: [{
        message: '获取配置失败'
      }]
    })
    return
  }

  res.send({
    data: {
      ...global.$globalConfig.siteSettings,
      ...global.$globalConfig.commentSettings
    }
  })
}
