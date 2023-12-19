var mongoose = require('mongoose');
const globalConfigUtils = require('../config/globalConfig')
const cacheDataUtils = require('../config/cacheData')
console.info('数据库连接中...');
// console.log('数据库地址：', process.env.DB_HOST);
if (!process.env.DB_HOST) {
  console.error('请在根目录下创建.env文件，并添加数据库地址。');
  process.exit(1);
}
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

db.once('open', async () => {
  console.info('数据库连接成功！');
  await globalConfigUtils.initGlobalConfig()
  cacheDataUtils.getNaviList()
  cacheDataUtils.getSidebarList()
  cacheDataUtils.getBannerList()
  cacheDataUtils.getSortList()
  cacheDataUtils.getPostArchiveList()
})

db.on('error', function (error) {
  console.error(
    'Error in MongoDb connection: ' + error
  );
  mongoose.disconnect();
});

db.on('close', function () {
  console.error(
    '数据库断开，重新连接数据库'
  );
  mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
});

module.exports = db;