const utils = require('./utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const postUtils = require('../mongodb/utils/posts')
const tagUtils = require('../mongodb/utils/tags')
const sortUtils = require('../mongodb/utils/sorts')

exports.refreshTagsPublicPost = async function (query = {}) {
  try {
    const tagsCursor = tagUtils.findCursor(query, {}, '_id publicPost')
    let changeCount = 0
    const promiseArr = []
    for await (const tag of tagsCursor) {
      const _id = tag._id
      const promise = new Promise(async (resolve, reject) => {
        try {
          // 查询有多少篇status为1的文章 包含了该标签
          const count = await postUtils.count({
            tags: _id,
            status: 1
          })
          if (count !== tag.publicPost) {
            await tagUtils.updateOne(
              { _id: tag._id },
              { publicPost: count }
            )
            changeCount++
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      promiseArr.push(promise)

      if (promiseArr.length > 50) {
        console.info('处理50个标签')
        await Promise.all(promiseArr)
        promiseArr.length = 0
      }
    }

    console.info(`处理剩余标签 ${promiseArr.length}`)
    await Promise.all(promiseArr);
    console.info(`已处理标签数：${changeCount}`)
  } catch (err) {
    adminApiLog.error(`Tag post count refresh failed: ${logErrorToText(err)}`)
  }
}


exports.refreshSortsPublicPost = async function (query = {}) {
  try {
    const sortsCursor = sortUtils.findCursor({}, {}, '_id publicPost')
    let changeCount = 0
    const promiseArr = []
    for await (const sort of sortsCursor) {
      const _id = sort._id
      const promise = new Promise(async (resolve, reject) => {
        try {
          // 查询有多少篇status为1的文章 包含了该分类
          const count = await postUtils.count({
            sort: _id,
            status: 1
          })

          if (count !== sort.publicPost) {
            await sortUtils.updateOne(
              { _id: sort._id },
              { publicPost: count }
            )
            changeCount++
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      promiseArr.push(promise)

      if (promiseArr.length > 50) {
        console.info('处理50个分类')
        await Promise.all(promiseArr)
        promiseArr.length = 0
      }
    }

    console.info(`处理剩余分类 ${promiseArr.length}`)
    await Promise.all(promiseArr);
    console.info(`已处理分类数：${changeCount}`)
  } catch (err) {
    adminApiLog.error(`Tag post count refresh failed: ${logErrorToText(err)}`)
  }
}