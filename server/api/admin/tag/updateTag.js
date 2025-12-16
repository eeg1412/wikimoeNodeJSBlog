const tagUtils = require('../../../mongodb/utils/tags')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // tagname	String	是	否	无	标签名称
  const { tagname, id, __v } = req.body
  // 校验格式
  const params = {
    tagname: utils.replaceSpacesWithUnderscores(tagname || '')
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: 'tagname',
      label: '标签名称',
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: '__v',
      label: '__v',
      required: true,
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  tagUtils
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
      // utils.reflushBlogCache()
      adminApiLog.info(`tag:${tagname} update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '标签更新失败'
          }
        ]
      })
      adminApiLog.error(`tag:${tagname} update fail, ${logErrorToText(err)}`)
    })
}
