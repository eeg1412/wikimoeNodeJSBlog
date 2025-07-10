const mongoose = require('mongoose')
const globalConfigUtils = require('../config/globalConfig')
const cacheDataUtils = require('../config/cacheData')
const rssToolUtils = require('../utils/rss')
const sitemapToolUtils = require('../utils/sitemap')
let mongodbErrorCount = 0
console.info('数据库连接中...')
// console.log('数据库地址：', process.env.DB_HOST);
if (!process.env.DB_HOST) {
  console.error('请在根目录下创建.env文件，并添加数据库地址。')
  process.exit(1)
}
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection

function handleDbError() {
  global.$isReady = false
  mongodbErrorCount++
  if (mongodbErrorCount > 10) {
    console.error('数据库连接失败次数过多，程序退出')
    // mongoose.disconnect();
    process.exit(1)
  }
  let retryTime = 10000 * mongodbErrorCount
  console.error(`数据库连接失败，${retryTime / 1000}秒后重新连接数据库`)
  setTimeout(() => {
    console.info('数据库连接中...')
    mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }, retryTime)
}

db.on('open', async () => {
  console.info('数据库连接成功！')
  mongodbErrorCount = 0
  // 更新时注意同时更新还原时的缓存
  await globalConfigUtils.initGlobalConfig()
  cacheDataUtils.getNaviList()
  cacheDataUtils.getSidebarList()
  cacheDataUtils.getBannerList()
  cacheDataUtils.getSortList()
  cacheDataUtils.getPostArchiveList()
  cacheDataUtils.getBangumiYearList()
  cacheDataUtils.getMovieYearList()
  rssToolUtils.reflushRSS()
  sitemapToolUtils.reflushSitemap()
  global.$isReady = true
})

db.on('error', function (error) {
  console.error('Error in MongoDb connection: ' + error)
  handleDbError()
})

db.on('close', function () {
  // 如果未来有手动断开数据库连接的需求，需要注意这里的处理，避免重连
  console.error('数据库断开，重新连接数据库')
  handleDbError()
})

module.exports = db
