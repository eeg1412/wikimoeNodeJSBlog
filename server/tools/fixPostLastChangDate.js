require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const postsUtil = require('../mongodb/utils/posts')

const init = async () => {
  console.log(chalk.green('开始修复文章lastChangDate字段'))
  const cursor = postsUtil.findCursor({}, {}, 'lastChangDate date _id')
  const promiseArr = []
  // 遍历所有文章，将lastChangDate设置为date
  for await (const post of cursor) {
    if (post.date) {
      const lastChangDate = post.date
      const promise = postsUtil
        .updateOne({ _id: post._id }, { lastChangDate })
        .then(() => {
          console.log(chalk.green(`文章${post._id} lastChangDate字段修复完成`))
        })
        .catch(err => {
          console.log(chalk.red(`文章${post._id} lastChangDate字段修复失败`))
          console.log(err)
        })
      promiseArr.push(promise)
    }
    if (promiseArr.length > 100) {
      console.log(chalk.green('处理100篇文章'))
      await Promise.all(promiseArr)
      promiseArr.length = 0
    }
  }
  // 循环结束后处理剩余的promises
  console.log(chalk.green('处理剩余文章 ' + promiseArr.length))
  await Promise.all(promiseArr)
  console.log(chalk.green('文章lastChangDate字段修复完成'))
  // 关闭
  process.exit(0)
}

db.once('open', () => {
  init()
})
