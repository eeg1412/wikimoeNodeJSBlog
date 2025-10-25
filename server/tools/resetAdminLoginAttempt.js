require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const optionUtils = require('../mongodb/utils/options')
const utils = require('../utils/utils')

const init = async () => {
  const params = {
    siteAdminLoginAttemptTime: 1,
    siteAdminLoginMaxAttempts: 9999
  }
  // findoneAndUpdate
  const dbOptions = { upsert: true, new: true }
  for await (const [name, value] of Object.entries(params)) {
    await optionUtils
      .findOneAndUpdate({ name }, { value }, dbOptions)
      .then(data => {
        console.log(
          chalk.green(`option update success , ${JSON.stringify(data)}`)
        )
      })
      .catch(err => {
        console.log(
          chalk.red(`option update fail, ${utils.logErrorToText(err)}`)
        )
      })
  }
  console.log(chalk.green('重置管理员登录尝试限制 执行完毕'))
  // 关闭进程
  process.exit(0)
}

db.once('open', () => {
  init()
})
