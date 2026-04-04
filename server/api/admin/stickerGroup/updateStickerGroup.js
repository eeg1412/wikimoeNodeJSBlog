const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { name, taxis, status, id, __v } = req.body
  const params = {
    name,
    taxis,
    status
  }
  const bodyCheck = {
    ...params,
    id,
    __v
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
  const errors = utils.checkForm(bodyCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const oldData = await stickerGroupUtils.findOne({ _id: id, __v })
  if (!oldData) {
    res.status(400).json({
      errors: [
        {
          message: '该数据不存在或已被更新'
        }
      ]
    })
    return
  }

  stickerGroupUtils
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
      adminApiLog.info(`stickerGroup update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '贴纸组更新失败'
          }
        ]
      })
      adminApiLog.error(`stickerGroup update fail, ${logErrorToText(err)}`)
    })
}
