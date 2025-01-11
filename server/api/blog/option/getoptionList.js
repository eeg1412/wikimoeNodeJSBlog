const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

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
      ...global.$globalConfig.commentSettings,
      ...global.$globalConfig.rssSettings,
      ...global.$globalConfig.sitePostSettings,
      ...global.$globalConfig.adSettings,
    }
  })
}
