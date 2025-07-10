const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { id } = req.query

  const params = {
    _id: id,
    status: 1
  }

  const rule = [
    {
      key: '_id',
      label: 'ID',
      type: 'isMongoId',
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  eventUtils
    .findOne(params)
    .then(data => {
      if (!data) {
        res.status(404).json({
          errors: [
            {
              message: '活动不存在'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '活动详情获取失败'
          }
        ]
      })
      userApiLog.error(`event get fail, ${JSON.stringify(err)}`)
    })
}
