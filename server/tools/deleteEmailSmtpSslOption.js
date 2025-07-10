require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const optionUtils = require('../mongodb/utils/options')

const init = async () => {
  // 删除name为emailSmtpSsl 的数据
  console.log(chalk.green('删除emailSmtpSsl'))
  const res1 = await optionUtils.deleteMany({
    name: 'emailSmtpSsl'
  })
  console.log(chalk.green('删除emailSmtpSsl成功', JSON.stringify(res1)))
  // 关闭
  process.exit(0)
}

db.once('open', () => {
  init()
})
