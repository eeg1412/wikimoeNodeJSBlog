require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const path = require('path')
const fs = require('fs')

async function updateCollectionDefaults(model) {
  console.log(`处理集合 ${model.collection.name}...`)

  // 获取schema中所有带default值的字段
  const defaultFields = {}
  Object.keys(model.schema.paths).forEach(path => {
    const schemaType = model.schema.paths[path]
    if (schemaType.defaultValue !== undefined && schemaType.path !== '_id') {
      defaultFields[path] = schemaType.defaultValue
    }
  })

  if (Object.keys(defaultFields).length === 0) {
    console.log(`在 ${model.collection.name} 中没有找到默认值`)
    return
  }

  // 构建查询条件：找出缺少这些字段的文档
  const orConditions = Object.keys(defaultFields).map(field => ({
    [field]: { $exists: false }
  }))
  const fieldSelection = '_id ' + Object.keys(defaultFields).join(' ')

  const BATCH_SIZE = 50 // 每批处理50条文档
  const totalCount = await model.collection.countDocuments({
    $or: orConditions
  })

  if (totalCount === 0) {
    console.log(
      chalk.yellow(`在 ${model.collection.name} 中没有需要更新的文档`)
    )
    return
  }

  // 查找需要更新的文档
  console.log(
    chalk.green(
      `在 ${model.collection.name} 中找到 ${totalCount} 个需要更新的文档`
    )
  )
  console.log('需要更新的字段和默认值:', defaultFields)

  let processedCount = 0
  const cursor = model.collection.find({ $or: orConditions }, fieldSelection)

  try {
    let batch = []

    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      processedCount++

      const missingFields = Object.keys(defaultFields).filter(field => {
        return !(field in doc)
      })

      if (missingFields.length > 0) {
        const updateValues = missingFields.reduce((acc, field) => {
          let defaultValue = defaultFields[field]
          if (typeof defaultValue === 'function') {
            defaultValue = defaultValue()
          }
          acc[field] = defaultValue
          return acc
        }, {})

        // 将更新操作添加到批处理数组
        batch.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: updateValues }
          }
        })

        console.log(`\n[${processedCount}/${totalCount}] 文档 ID: ${doc._id}`)
        console.log('将要设置的默认值:', updateValues)
      }

      // 当批次达到指定大小或处理完最后一个文档时执行批量更新
      if (batch.length >= BATCH_SIZE || !(await cursor.hasNext())) {
        if (batch.length > 0) {
          console.log(chalk.yellow(`\n批量更新 ${batch.length} 个文档...`))
          await model.collection.bulkWrite(batch)
          // 模拟5秒延迟
          // await new Promise(resolve => setTimeout(resolve, 5000));
          console.log(chalk.green('批量更新完成'))
          batch = []
        }
      }

      // 每处理100条打印一次进度
      if (processedCount % 100 === 0) {
        console.log(
          chalk.cyan(`\n已处理 ${processedCount}/${totalCount} 个文档...`)
        )
      }
    }
  } finally {
    await cursor.close()
  }

  console.log(
    chalk.green(
      `\n${model.collection.name} 集合处理完成，共处理 ${processedCount} 个文档`
    )
  )
}

async function main() {
  try {
    // 读取models目录
    const modelsPath = path.join(__dirname, '../mongodb/models')
    const files = fs.readdirSync(modelsPath)

    // 过滤出.js文件
    const modelFiles = files.filter(file => file.endsWith('.js'))

    // 处理每个model文件
    for (const file of modelFiles) {
      const modelPath = path.join(modelsPath, file)
      const model = require(modelPath)

      if (model.schema) {
        await updateCollectionDefaults(model)
      }
    }

    console.log('所有集合处理完成')
    process.exit(0)
  } catch (error) {
    console.error('错误:', error)
    process.exit(1)
  }
}

db.once('open', () => {
  main()
})
