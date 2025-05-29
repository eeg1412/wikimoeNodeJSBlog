const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone');
const readerlogUtils = require('../../../mongodb/utils/readerlogs')

module.exports = async function (req, res, next) {
  const startTime = req.query.startTime
  const endTime = req.query.endTime

  const limit = 100

  // 时间格式是 2023-08-10T15:00:00.000Z 需要判断合法性
  const rule = [
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

  const errors = utils.checkForm({
    startTime, endTime
  }, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const startDate = moment(startTime)
  const endDate = moment(endTime)

  try {
    // 使用单条聚合查询完成所有需求
    const pipeline = [
      // 1. 首先匹配符合条件的文档
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          isBot: false,  // 排除机器人访问
          action: 'open',
          'data.performanceNavigationTiming': { $ne: null },
          'data.performanceNavigationTiming.duration': { $ne: null },
          'data.performanceNavigationTiming.duration': { $gt: 0 }  // 剔除duration小于等于0的记录
        }
      },
      // 2. 只保留需要的字段，减少内存使用
      {
        $project: {
          ip: 1,
          ipInfo: 1,
          createdAt: 1,
          'data.performanceNavigationTiming': 1
        }
      },
      // 3. 根据IP分组，取每组中duration最大的记录（如果相同则取最早时间的）
      {
        $sort: {
          'data.performanceNavigationTiming.duration': -1,
          createdAt: 1
        }
      },
      {
        $group: {
          _id: "$ip",
          ip: { $first: "$ip" },
          ipInfo: { $first: "$ipInfo" },
          performanceNavigationTiming: { $first: "$data.performanceNavigationTiming" },
          createdAt: { $first: "$createdAt" }
        }
      },
      // 4. 使用$facet分别计算统计数据和获取最快/最慢列表
      {
        $facet: {
          // 统计数据
          "stats": [
            {
              $group: {
                _id: null,
                maxDuration: { $max: "$performanceNavigationTiming.duration" },
                minDuration: { $min: "$performanceNavigationTiming.duration" },
                avgDuration: { $avg: "$performanceNavigationTiming.duration" },
                count: { $sum: 1 }
              }
            }
          ],
          // 最慢的数据
          "slowestData": [
            {
              $sort: {
                'performanceNavigationTiming.duration': -1,
                createdAt: 1
              }
            },
            {
              $limit: limit
            },
            {
              $project: {
                _id: 0,
                ip: 1,
                ipInfo: 1,
                performanceNavigationTiming: 1,
                createdAt: 1
              }
            }
          ],
          // 最快的数据
          "fastestData": [
            {
              $sort: {
                'performanceNavigationTiming.duration': 1,
                createdAt: 1
              }
            },
            {
              $limit: limit
            },
            {
              $project: {
                _id: 0,
                ip: 1,
                ipInfo: 1,
                performanceNavigationTiming: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ];

    const result = await readerlogUtils.aggregate(pipeline);

    if (!result || result.length === 0) {
      res.status(500).json({
        errors: [{
          message: '数据库查询错误'
        }]
      });
      return;
    }

    // 处理结果数据
    const sendData = {
      stats: result[0].stats.length > 0 ? result[0].stats[0] : { maxDuration: 0, minDuration: 0, avgDuration: 0, count: 0 },
      slowestData: result[0].slowestData,
      fastestData: result[0].fastestData
    };

    // 发送响应
    res.send(sendData);
  } catch (error) {
    console.error(error);
    adminApiLog.error(error);
    res.status(500).json({
      errors: [{
        message: '服务器内部错误'
      }]
    });
  }
}