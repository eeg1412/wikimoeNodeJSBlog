const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const postUtils = require('../../../mongodb/utils/posts')
const sortUtils = require('../../../mongodb/utils/sorts')

module.exports = async function (req, res, next) {
  res.send({
    message: '提交成功，正在统计'
  })
  global.$isReady = false

  try {
    const sortsCursor = sortUtils.findCursor({}, {}, '_id')

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

          await sortUtils.updateOne(
            { _id: sort._id },
            { publicPost: count }
          )
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

    global.$isReady = true
  } catch (err) {
    adminApiLog.error(`Tag post count refresh failed: ${logErrorToText(err)}`)
    global.$isReady = true
  }
}