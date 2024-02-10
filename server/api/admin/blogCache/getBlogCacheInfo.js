const blogCachesUtils = require('../../../mongodb/utils/blogCaches')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // 获取blogCache的占用空间
  const mongodb = global.$mongodDB
  const db = mongodb.db.collection('blogcaches')
  const stats = await db.stats()
  const isCapped = await db.isCapped()
  const blogCacheSize = stats.size
  const blogCacheMaxSize = stats.maxSize || 0
  // 转换成MB
  const blogCacheSizeMB = blogCacheSize / 1024 / 1024
  const blogCacheMaxSizeMB = blogCacheMaxSize / 1024 / 1024
  const blogCacheCount = await blogCachesUtils.count()

  const data = {
    blogCacheSize: blogCacheSizeMB.toFixed(3),
    blogCacheMaxSize: blogCacheMaxSizeMB.toFixed(3),
    blogCacheCount,
    isCapped
  }
  adminApiLog.info('获取blogCache信息成功')


  res.send({
    data
  })
}
