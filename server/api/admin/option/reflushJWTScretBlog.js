const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  try {
    const JWTSecretBlog = utils.ensureJWTSecretBlog(true)
    global.$secret.JWTSecretBlog = JWTSecretBlog
    res.send({
      message: '刷新成功',
    })
    adminApiLog.info(`JWTSecretBlog reflush success`)
  } catch (error) {
    adminApiLog.error(`JWTSecretBlog reflush failed: ${logErrorToText(error)}`)
    res.status(400).json({
      errors: [
        {
          message: '刷新失败',
        },
      ],
    })
  }
}
