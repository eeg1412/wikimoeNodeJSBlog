const albumUtils = require('../../../mongodb/utils/albums')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')


module.exports = async function (req, res, next) {

  const { name } = req.body
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
  // save
  albumUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`album:${name} create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '相册创建失败'
      }]
    })
    adminApiLog.error(`album:${name} create fail, ${JSON.stringify(err)}`)
  })

}
