const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  res.send({
    data: {
      cacheVersion: global.$cacheVersion || 0
    }
  })
}
