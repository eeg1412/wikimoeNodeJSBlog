const postLikeLogUtils = require('../../../mongodb/utils/postLikeLogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // 获取开始结束时间
  const { startTime, endTime } = req.query
  const params = {
    startTime,
    endTime,
  }
  // 校验开始结束时间是否是 2024-03-20T15:00:00.000Z 格式
  const rule = [
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
  // 删除开始结束时间之间的数据
  postLikeLogUtils
    .deleteMany({
      date: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    })
    .then((data) => {
      res.send({
        data: data,
      })
      adminApiLog.info(`postLikeLog delete success`)
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '文章点赞日志删除失败',
          },
        ],
      })
      adminApiLog.error(`postLikeLog delete fail, ${logErrorToText(err)}`)
    })
}
