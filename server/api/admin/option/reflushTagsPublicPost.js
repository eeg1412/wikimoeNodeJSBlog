const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const postUtils = require('../../../mongodb/utils/posts')
const tagUtils = require('../../../mongodb/utils/tags')

module.exports = async function (req, res, next) {
  res.send({
    message: '提交成功，正在统计'
  })
  global.$isReady = false

  try {
    const tagsCursor = tagUtils.findCursor({}, {}, '_id')

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

          await tagUtils.updateOne(
            { _id: tag._id },
            { publicPost: count }
          )
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

    global.$isReady = true
  } catch (err) {
    adminApiLog.error(`Tag post count refresh failed: ${logErrorToText(err)}`)
    global.$isReady = true
  }
}