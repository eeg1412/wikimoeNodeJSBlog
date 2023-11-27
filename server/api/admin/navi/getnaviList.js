const naviUtils = require('../../../mongodb/utils/navis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sort = {
    taxis: -1,
    _id: -1
  }
  naviUtils.find({}, sort).then((data) => {
    // 根据返回的data，配合parent字段，生成树形结构
    const jsonData = data.map(doc => doc.toJSON())
    const treeData = utils.generateTreeData(jsonData)
    res.send({
      data: treeData
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '导航列表获取失败'
      }]
    })
    adminApiLog.error(`navi list get fail, ${JSON.stringify(err)
      }`)
  })
}
