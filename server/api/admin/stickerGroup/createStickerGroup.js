const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name, taxis, status } = req.body
  const params = {
    name,
    taxis,
    status
  }
  const rule = [
    {
      key: 'name',
      label: '名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'taxis',
      label: '排序',
      strict: true,
      strictType: 'number',
      required: false
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number',
      required: false
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  stickerGroupUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`stickerGroup create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '贴纸组创建失败'
          }
        ]
      })
      adminApiLog.error(`stickerGroup create fail, ${logErrorToText(err)}`)
    })
}
