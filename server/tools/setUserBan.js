require('dotenv').config()
const chalk = require('chalk')
const username = process.argv[2]
if (!username) {
  console.log(chalk.red('用户名不能为空'))
  return
}
const db = require('./mongodb')
require('../mongodb/utils/attachments')
const userUtils = require('../mongodb/utils/users')
const utils = require('../utils/utils')

const checkAdmin = async () => {
  console.log('checking...')
  const res = await userUtils.findOne({ username: username })
  if (res) {
    return res
  } else {
    console.log(chalk.red('用户不存在'))
    // 关闭进程
    process.exit(0)
  }
}

const setBan = async () => {
  const isBan = process.argv[3] === '1' ? true : false
  const res = await userUtils.updateOne(
    { username: username },
    { disabled: isBan },
  )
  if (res.modifiedCount > 0) {
    const text = isBan ? '禁用' : '解禁'
    console.log(chalk.green(`${username}${text}成功`))
  } else {
    console.log(chalk.red('设置失败'))
  }
  // 关闭进程
  process.exit(0)
}

const init = async () => {
  await checkAdmin()
  await setBan()
}

db.once('open', () => {
  init()
})
