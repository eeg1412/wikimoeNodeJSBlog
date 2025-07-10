var express = require('express')
var router = express.Router()
const rsslogUtils = require('../../mongodb/utils/rsslogs')
const utils = require('../../utils/utils')
const rssToolUtils = require('../../utils/rss')
// const moment = require('moment-timezone');
router.get('/:type?', async function (req, res, next) {
  const type = req.params.type || 'all'
  const config = global.$globalConfig?.rssSettings || {}
  const { siteEnableRss } = config
  if (siteEnableRss !== true) {
    res.status(404).send('Not found')
    return
  }

  // 发送rss
  rssToolUtils.getRSS(type, res)

  // 记录日志
  const ip = utils.getUserIp(req)
  const rsslogParams = {
    ip: ip,
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
    deviceInfo: utils.deviceUAInfoUtils(req),
    rssPath: req.path
  }
  let uaStr = req.headers['user-agent'] || ''
  // 最多1000个字符
  if (uaStr.length > 1000) {
    uaStr = uaStr.substring(0, 1000)
  }
  // 查找ua里面的url链接
  const uaUrl = uaStr.match(/(https?:\/\/[^\s;)]+)/g)
  if (uaUrl && uaUrl.length > 0) {
    rsslogParams.reader = uaUrl[0]
  }
  await rsslogUtils.save(rsslogParams)
})

module.exports = router
