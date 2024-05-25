require('dotenv').config()
const chalk = require('chalk')
const username = process.argv[2]
const newPassword = process.argv[3]
if (!username || !newPassword) {
  console.log(chalk.red('用户名或新密码不能为空'))
  return
}
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/
if (!passwordReg.test(newPassword)) {
  console.log(chalk.red('密码必须4位以上且包含大小写、数字和符号（!@#$%^&*）'))
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

const changePassword = async () => {
  const password = utils.creatBcryptStr(newPassword)
  const res = await userUtils.updateOne({ username: username }, { password: password, $inc: { pwversion: 1 } })
  if (res.modifiedCount > 0) {
    console.log(chalk.green('密码修改成功'))
  } else {
    console.log(chalk.red('密码修改失败'))
  }
  // 关闭进程
  process.exit(0)
}

const init = async () => {
  await checkAdmin()
  await changePassword()
}


db.once('open', () => {
  init()
})