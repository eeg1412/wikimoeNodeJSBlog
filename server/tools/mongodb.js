var mongoose = require('mongoose')
console.info('数据库连接中...')
// console.log('数据库地址：', process.env.DB_HOST);
if (!process.env.DB_HOST) {
  console.error('请在根目录下创建.env文件，并添加数据库地址。')
  process.exit(1)
}
mongoose.connect(process.env.DB_HOST)
var db = mongoose.connection

db.once('open', async () => {
  console.info('数据库连接成功！')
  // 输出mongodb版本信息
  try {
    const nativeDb = db.db
    if (!nativeDb) throw new Error('无法获取原生 MongoDB db 对象')
    const admin = nativeDb.admin()
    const buildInfo = await admin.command({ buildInfo: 1 })
    console.info(`MongoDB 版本：${buildInfo.version}`)
  } catch (err) {
    console.warn('获取MongoDB版本信息失败：', err.message || err)
  }
})

db.on('error', function (error) {
  console.error('Error in MongoDb connection: ' + error)
  mongoose.disconnect()
})

db.on('close', function () {
  console.error('数据库断开')
})

module.exports = db
