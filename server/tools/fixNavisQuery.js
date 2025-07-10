require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const navisUtils = require('../mongodb/utils/navis')

const init = async () => {
  console.log(chalk.green('开始修复导航query字段'))
  // 查找所有 query 字段为对象类型的文档
  const docs = await navisUtils.find(
    {
      query: { $type: 'object' }
    },
    undefined,
    undefined,
    { lean: true }
  )
  console.log(`找到 ${docs.length} 个需要更新的文档`)

  // 逐个更新文档
  for (const doc of docs) {
    if (doc.query && typeof doc.query === 'object') {
      // 将对象转换为字符串
      const queryString = ''

      // 更新该文档
      await navisUtils.updateOne(
        { _id: doc._id },
        { $set: { query: queryString } },
        {
          strict: false, // 忽略架构验证
          new: true // 返回更新后的文档
        }
      )
    }
  }

  console.log('更新完成')
  process.exit(0)
}

db.once('open', () => {
  init()
})
