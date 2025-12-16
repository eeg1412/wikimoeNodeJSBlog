const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const type = req.body.type
  // 校验格式
  const params = {
    type: type
  }
  const rule = [
    {
      key: 'type',
      label: '类型',
      type: 'isIn',
      options: ['1', '2', '3'],
      required: true,
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 获取管理员ID
  const adminId = req.admin._id
  // 校验格式
  const updateData = {
    type: type,
    author: adminId,
    lastChangDate: new Date()
  }

  // save
  postUtils
    .save(updateData)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`post create success`)
      cacheDataUtils.getPostArchiveList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '创建文章失败'
          }
        ]
      })
      adminApiLog.error(`post create fail, ${logErrorToText(err)}`)
    })
}
