require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
require('../mongodb/utils/attachments')
const userUtils = require('../mongodb/utils/users')
const utils = require('../utils/utils')

const init = async () => {
  const res = await userUtils.find({})
  // 打印成table，只输出username和disabled
  console.table(res.map(item => {
    return {
      username: item.username,
      disabled: item.disabled
    }
  }))
  // 关闭
  process.exit(0)
}

db.once('open', () => {
  init()
})