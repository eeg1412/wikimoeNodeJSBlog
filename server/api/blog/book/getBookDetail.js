const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { id } = req.query

  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }

  // 验证id格式
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }

  const params = {
    _id: id,
    status: 1
  }

  try {
    const data = await bookUtils.findOne(params, 'title booktype')

    if (!data) {
      res.status(404).json({
        errors: [
          {
            message: '书籍不存在'
          }
        ]
      })
      userApiLog.error(`book detail get fail, 书籍不存在, id: ${id}`)
      return
    }

    res.send({
      data: data
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '书籍详情获取失败'
        }
      ]
    })
    userApiLog.error(`book detail get fail, ${logErrorToText(err)}`)
  }
}
