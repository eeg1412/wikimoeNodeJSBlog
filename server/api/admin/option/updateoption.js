const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const optionList = req.body.optionList || []
  const resList = []
  // optionList 为name 和 value 的数组,name是必须的
  // for await 遍历数组
  for await (const item of optionList) {
    const { name, value } = item
    // 如果name不存在,则跳过
    if (!name) continue
    // findoneAndUpdate
    const dbOptions = { upsert: true, new: true };
    await optionUtils.findOneAndUpdate({ name }, { value }, dbOptions).then((data) => {
      resList.push(data.toJSON())
      adminApiLog.info(`option update success , ${JSON.stringify(data)}`)
    }).catch((err) => {
      adminApiLog.error(`option update fail, ${JSON.stringify(err)}`)
    })
  }
  // 返回结果
  res.send({
    data: resList
  })

}
