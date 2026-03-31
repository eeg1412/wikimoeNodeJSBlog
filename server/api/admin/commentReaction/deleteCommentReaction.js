const commentReactionUtils = require('../../../mongodb/utils/commentReactions')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { startTime, endTime } = req.query
  const params = {
    startTime,
    endTime
  }
  const rule = [
    {
      key: 'startTime',
      label: '开始时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true
      }
    },
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  if (new Date(endTime) < new Date(startTime)) {
    res.status(400).json({
      errors: [
        {
          message: '结束时间不能在开始时间之前'
        }
      ]
    })
    return
  }
  commentReactionUtils
    .deleteMany({
      date: {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      }
    })
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`commentReaction delete success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '评论反应日志删除失败'
          }
        ]
      })
      adminApiLog.error(`commentReaction delete fail, ${logErrorToText(err)}`)
    })
}
