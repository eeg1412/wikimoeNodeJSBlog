const albumUtils = require('../../../mongodb/utils/albums')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // name	String	是	否	无	相册名称
  const { name, id, __v } = req.body
  // 校验格式
  const params = {
    name
  }
  const bodyCheck = {
    ...params,
    id,
    __v
  }
  const rule = [
    {
      key: 'name',
      label: '相册名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
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
      type: 'isInt',
      options: {
        min: 0
      },
      required: true
    }
  ]
  const errors = utils.checkForm(bodyCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // name不能重复
  const album = await albumUtils.findOne({ name, _id: { $ne: id } })
  if (album) {
    res.status(400).json({
      errors: [
        {
          message: '相册名称已存在'
        }
      ]
    })
    return
  }
  // updateOne
  albumUtils
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
      adminApiLog.info(`album:${name} update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '相册更新失败'
          }
        ]
      })
      adminApiLog.error(`album:${name} update fail, ${logErrorToText(err)}`)
    })
}
