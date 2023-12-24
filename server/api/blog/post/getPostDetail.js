
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  const type = req.query.type
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  const params = {
    status: 1,
  }
  if (type && Array.isArray(type) && type.length > 0) {
    // type是数组
    // 将type转换为数字
    let newType = type.map(Number);
    params.type = {
      $in: newType
    }
  }
  // 判断id是否是ObjectId
  if (utils.isObjectId(id)) {
    // 根据id查询
    params._id = id
  } else {
    // 根据alias查询
    params.alias = id
  }
  // findOne
  postUtils.findOne(params).then((data) => {
    if (!data) {
      res.status(404).json({
        errors: [{
          message: '文章不存在'
        }]
      })
      userApiLog.error(`post detail get fail, 文章不存在, id: ${id}`)
      return
    }
    res.send({
      data: data
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '文章详情获取失败'
      }]
    })
    userApiLog.error(`post detail get fail, ${JSON.stringify(err)}`)
  })
}
