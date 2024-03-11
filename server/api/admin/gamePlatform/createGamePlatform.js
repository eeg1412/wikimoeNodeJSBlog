const gamePlatformUtils = require('../../../mongodb/utils/gamePlatforms')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  const { name, color } = req.body
  // 校验格式
  const params = {
    name, color
  }
  const rule = [
    {
      key: 'name',
      label: '游戏平台名称',
      type: null,
      required: true
    },
    {
      key: 'color',
      label: '颜色',
      type: null,
      required: true
    }

  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  gamePlatformUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`gamePlatform create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '游戏平台创建失败'
      }]
    })
    adminApiLog.error(`gamePlatform create fail, ${logErrorToText(err)}`)
  })

}
