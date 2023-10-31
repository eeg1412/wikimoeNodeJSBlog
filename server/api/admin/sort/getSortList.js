const chalk = require('chalk')
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const params = {}
  const sort = { taxis: 1 }
  sortUtils.find(params, sort).then((data) => {
    // 根据返回的data，配合parent字段，生成树形结构
    const treeData = utils.generateTreeData(data)
    res.send({
      data: treeData
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '分类列表获取失败'
      }]
    })
    adminApiLog.error(`sort list get fail, ${JSON.stringify(err)}`)
  })
}
