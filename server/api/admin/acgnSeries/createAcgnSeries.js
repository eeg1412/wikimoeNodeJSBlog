const acgnSeriesUtils = require('../../../mongodb/utils/acgnSeries')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name, alias, summary } = req.body
  // 校验格式
  const params = {
    name,
    alias,
    summary
  }
  const rule = [
    {
      key: 'name',
      label: '名称',
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

  // name 长度校验
  if (name.length < 1) {
    res.status(400).json({
      errors: [{ message: '名称必须大于1个字符' }]
    })
    return
  }

  // alias 校验
  if (alias) {
    if (!Array.isArray(alias)) {
      res.status(400).json({
        errors: [{ message: '别名格式错误' }]
      })
      return
    }
    for (let i = 0; i < alias.length; i++) {
      if (typeof alias[i] !== 'string' || alias[i].length < 1) {
        res.status(400).json({
          errors: [{ message: '别名内容必须大于1个字符' }]
        })
        return
      }
    }
  }

  // save
  acgnSeriesUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`acgnSeries create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [{ message: '系列创建失败' }]
      })
      adminApiLog.error(`acgnSeries create fail, ${logErrorToText(err)}`)
    })
}
