
const albumUtils = require('../../../mongodb/utils/albums')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // name	String	是	否	无	相册名称
  const { name, id, __v } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    name: name,
  }
  const rule = [
    {
      key: 'name',
      label: '相册名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // name不能重复
  const album = await albumUtils.findOne({ name })
  if (album) {
    res.status(400).json({
      errors: [{
        message: '相册名称已存在'
      }]
    })
    return
  }
  // updateOne
  albumUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`album:${name} update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '相册更新失败'
      }]
    })
    adminApiLog.error(`album:${name} update fail, ${logErrorToText(err)}`)
  })
}
