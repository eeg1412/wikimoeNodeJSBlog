const tagUtils = require('../../../mongodb/utils/tags')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  const { tagname } = req.body
  // 校验格式
  const params = {
    tagname: utils.replaceSpacesWithUnderscores(tagname || ''),
  }
  const rule = [
    {
      key: 'tagname',
      label: '标签名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  tagUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    // utils.reflushBlogCache()
    adminApiLog.info(`tag:${tagname} create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '标签创建失败'
      }]
    })
    adminApiLog.error(`tag:${tagname} create fail, ${logErrorToText(err)}`)
  })

}
