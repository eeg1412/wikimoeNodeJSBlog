const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  try {
    const JWTSecretAdmin = utils.ensureJWTSecretAdmin(true)
    global.$secret.JWTSecretAdmin = JWTSecretAdmin
    res.send({
      message: '刷新成功',
    })
    adminApiLog.info(`JWTSecretAdmin reflush success`)
  } catch (error) {
    adminApiLog.error(`JWTSecretAdmin reflush failed: ${logErrorToText(error)}`)
    res.status(400).json({
      errors: [
        {
          message: '刷新失败',
        },
      ],
    })
  }
}
