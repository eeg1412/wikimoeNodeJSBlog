var mongoose = require('mongoose')
// 引入数据库模型工具
const albumsUtil = require('../mongodb/utils/albums')
const attachmentsUtil = require('../mongodb/utils/attachments')
const backupsUtil = require('../mongodb/utils/backups')
const bangumisUtil = require('../mongodb/utils/bangumis')
const bannersUtil = require('../mongodb/utils/banners')
const booksUtil = require('../mongodb/utils/books')
const booktypesUtil = require('../mongodb/utils/booktypes')
const commentLikeLogsUtil = require('../mongodb/utils/commentLikeLogs')
const commentsUtil = require('../mongodb/utils/comments')
const emailSendHistorysUtil = require('../mongodb/utils/emailSendHistorys')
const eventsUtil = require('../mongodb/utils/events')
const eventtypesUtil = require('../mongodb/utils/eventtypes')
const gamePlatformsUtil = require('../mongodb/utils/gamePlatforms')
const gamesUtil = require('../mongodb/utils/games')
const linksUtil = require('../mongodb/utils/links')
const navisUtil = require('../mongodb/utils/navis')
const optionsUtil = require('../mongodb/utils/options')
const postLikeLogsUtil = require('../mongodb/utils/postLikeLogs')
const postsUtil = require('../mongodb/utils/posts')
const readerlogsUtil = require('../mongodb/utils/readerlogs')
const referrersUtil = require('../mongodb/utils/referrers')
const rsslogsUtil = require('../mongodb/utils/rsslogs')
const sidebarsUtil = require('../mongodb/utils/sidebars')
const sortsUtil = require('../mongodb/utils/sorts')
const tagsUtil = require('../mongodb/utils/tags')
const usersUtil = require('../mongodb/utils/users')
console.info('数据库连接中...')
// console.log('数据库地址：', process.env.DB_HOST);
if (!process.env.DB_HOST) {
  console.error('请在根目录下创建.env文件，并添加数据库地址。')
  process.exit(1)
}
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
var db = mongoose.connection

db.once('open', async () => {
  console.info('数据库连接成功！')
})

db.on('error', function (error) {
  console.error('Error in MongoDb connection: ' + error)
  mongoose.disconnect()
})

db.on('close', function () {
  console.error('数据库断开')
})

module.exports = db
