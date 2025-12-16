const gamePlatformUtils = require('../../../mongodb/utils/gamePlatforms')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // gamePlatformname	String	是	否	无	游戏平台名称
  const { name, color, id, __v } = req.body
  // 校验格式
  const params = {
    name,
    color
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      strict: true,
      strictType: 'number',
      required: true
    },
    {
      key: 'name',
      label: '游戏平台名称',
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
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  gamePlatformUtils
    .updateOne({ _id: id, __v }, params)
    .then(data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
      adminApiLog.info(`gamePlatform update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '游戏平台更新失败'
          }
        ]
      })
      adminApiLog.error(`gamePlatform update fail, ${logErrorToText(err)}`)
    })
}
