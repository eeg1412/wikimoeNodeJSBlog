const eventtypeUtils = require('../../../mongodb/utils/eventtypes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name, color } = req.body
  // 校验格式
  const params = {
    name,
    color
  }
  const rule = [
    {
      key: 'name',
      label: '活动类型名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'color',
      label: '颜色',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  eventtypeUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`eventtype create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '活动类型创建失败'
          }
        ]
      })
      adminApiLog.error(`eventtype create fail, ${logErrorToText(err)}`)
    })
}
