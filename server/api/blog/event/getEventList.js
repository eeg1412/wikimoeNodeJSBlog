const eventUtils = require('../../../mongodb/utils/events')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { startTime, endTime } = req.query

  const params = {
    startTime, endTime
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
      errors: [{
        message: '时间信息有误'
      }]
    })
    return
  }
  // 开始时间和结束时间的范围在1980年1月1日到服务器时间的21年之后

  // 将开始时间和结束时间转换为Date对象
  const startTime_ = new Date(startTime);
  const endTime_ = new Date(endTime);

  // 获取1980年1月1日的日期
  const earliestDate = new Date(1980, 0, 1);

  // 获取服务器时间的20年之后的日期
  const latestDate = new Date();
  latestDate.setFullYear(latestDate.getFullYear() + 21);

  // 检查开始时间和结束时间是否在有效范围内
  if (startTime_ < earliestDate || startTime_ > latestDate || endTime_ < earliestDate || endTime_ > latestDate) {
    res.status(400).json({
      errors: [{
        message: '时间信息有误'
      }]
    })
    return;
  }

  const sort = {
    startTime: -1,
    _id: -1,
  }
  eventUtils.find({
    $or: [
      {
        startTime: {
          $gte: new Date(startTime),
          $lte: new Date(endTime),
        },
      },
      {
        endTime: {
          $gte: new Date(startTime),
          $lte: new Date(endTime),
        },
      },
    ],
  }, sort).then((data) => {
    res.send({
      list: data,
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '活动列表获取失败'
      }]
    })
    adminApiLog.error(`event list get fail, ${JSON.stringify(err)
      }`)
  })
}
