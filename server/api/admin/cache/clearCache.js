const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  try {
    // 增加缓存清除版本号，用于通知blog清除缓存
    global.$cacheVersion = (global.$cacheVersion || 0) + 1
    
    adminApiLog.info(`Cache cleared, new version: ${global.$cacheVersion}`)
    
    res.send({
      data: {
        success: true,
        cacheVersion: global.$cacheVersion,
        message: '缓存清除信号已发送'
      }
    })
  } catch (err) {
    adminApiLog.error(`Cache clear failed: ${JSON.stringify(err)}`)
    res.status(500).json({
      errors: [
        {
          message: '缓存清除失败'
        }
      ]
    })
  }
}
