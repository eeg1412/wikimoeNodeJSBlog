const almanacUtils = require('../../../mongodb/utils/almanacs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { almanacList } = req.body
  // 校验格式
  const params = {
    almanacList: almanacList || []
  }
  const rule = [
    {
      key: 'almanacList',
      label: '老黄历列表',
      strict: true,
      strictType: 'array'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // update
  const promises = params.almanacList.map(item => {
    return almanacUtils.updateOne({ _id: item._id }, { taxis: item.taxis })
  })
  Promise.all(promises)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`almanac taxis update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '老黄历排序更新失败'
          }
        ]
      })
      adminApiLog.error(`almanac taxis update fail, ${JSON.stringify(err)}`)
    })
}
