const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone');
const readerlogUtils = require('../../../mongodb/utils/readerlogs')


module.exports = async function (req, res, next) {
  const timeRangeType = req.query.timeRangeType
  const timeRangeTypeList = ['today', 'yesterday', 'week', 'month', 'year', 'all']
  // 判断timeRangeType是否符合格式
  if (!timeRangeTypeList.includes(timeRangeType)) {
    // 报错
    res.status(400).json({
      errors: [{
        message: '参数错误'
      }]
    })
    return
  }
  const vistorActionList = ['postList', 'postListArchive', 'postListKeyword', 'postListSort', 'postListTag', 'postView']
  const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
  // 根据 timeRangeType 计算开始日期和结束日期
  let startDate, endDate;
  switch (timeRangeType) {
    case 'today':
      startDate = moment().tz(siteTimeZone).startOf('day');
      endDate = moment().tz(siteTimeZone).endOf('day');
      break;
    case 'yesterday':
      startDate = moment().tz(siteTimeZone).subtract(1, 'days').startOf('day');
      endDate = moment().tz(siteTimeZone).subtract(1, 'days').endOf('day');
      break;
    case 'week':
      startDate = moment().tz(siteTimeZone).startOf('week');
      endDate = moment().tz(siteTimeZone).endOf('week');
      break;
    case 'month':
      startDate = moment().tz(siteTimeZone).startOf('month');
      endDate = moment().tz(siteTimeZone).endOf('month');
      break;
    case 'year':
      startDate = moment().tz(siteTimeZone).startOf('year');
      endDate = moment().tz(siteTimeZone).endOf('year');
      break;
    case 'all':
      startDate = moment(0).tz(siteTimeZone);  // 1970-01-01
      endDate = moment().tz(siteTimeZone);  // 现在
      break;
  }
  // 执行统计
  const result = await readerlogUtils.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        action: { $in: vistorActionList },
        $or: [
          { isBot: false },
          { isBot: { $exists: false } }
        ]
        // isBot: false
      }
    },
    {
      $group: {
        _id: null,
        pv: { $sum: 1 },
        uniqueIPs: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        _id: 0,
        pv: 1,
        uniqueIPCount: { $size: '$uniqueIPs' }
      }
    }
  ]);
  // 检查结果
  let data;
  if (result.length > 0) {
    data = result[0];
  } else {
    data = {
      pv: 0,
      uniqueIPCount: 0
    };
  }

  // 发送响应
  res.send({ data });
}
