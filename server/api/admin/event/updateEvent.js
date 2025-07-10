const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // eventname	String	是	否	无	活动名称
  const {
    eventtype,
    title,
    color,
    urlList,
    content,
    startTime,
    endTime,
    status,
    id,
    __v,
  } = req.body
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空',
        },
      ],
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [
        {
          message: '__v不能为空',
        },
      ],
    })
    return
  }
  // 校验格式
  const params = {
    eventtype,
    title,
    color,
    urlList,
    content,
    startTime,
    endTime,
    status,
  }
  const rule = [
    // eventtype
    {
      key: 'eventtype',
      label: '活动类型',
      type: 'isMongoId',
      required: true,
    },
    {
      key: 'title',
      label: '活动名称',
      type: null,
      required: true,
    },
    // startTime
    {
      key: 'startTime',
      label: '开始时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true,
      },
    },
    // endTime
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true,
      },
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 校验结束时间是否在开始时间之后
  if (new Date(endTime) < new Date(startTime)) {
    res.status(400).json({
      errors: [
        {
          message: '结束时间不能在开始时间之前',
        },
      ],
    })
    return
  }
  // updateOne
  eventUtils
    .updateOne({ _id: id, __v }, params)
    .then((data) => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败',
            },
          ],
        })
        return
      }
      res.send({
        data: data,
      })
      adminApiLog.info(`event update success`)
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '活动更新失败',
          },
        ],
      })
      adminApiLog.error(`event update fail, ${logErrorToText(err)}`)
    })
}
