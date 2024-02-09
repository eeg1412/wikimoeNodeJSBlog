const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {
  const type = req.body.type
  // 校验type只能为1，2，3
  if (type !== 1 && type !== 2 && type !== 3) {
    res.status(400).json({
      errors: [{
        message: 'type格式错误'
      }]
    })
    return
  }
  // 获取管理员ID
  const adminId = req.admin._id
  // 校验格式
  const params = {
    type: type,
    author: adminId,
  }

  // save
  postUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`post create success`)
    cacheDataUtils.getPostArchiveList()
    utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '创建文章失败'
      }]
    })
    adminApiLog.error(`post create fail, ${logErrorToText(err)}`)
  })

}
