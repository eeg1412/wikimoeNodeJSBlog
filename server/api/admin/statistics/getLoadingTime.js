const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')

module.exports = async function (req, res, next) {
  const startTime = req.query.startTime
  const endTime = req.query.endTime
  const timeZone = req.query.timeZone || 'Asia/Shanghai' // 默认使用中国时区

  // 校验 timeZone 是否合法
  const validTimeZones = moment.tz.names()
  if (!validTimeZones.includes(timeZone)) {
    res.status(400).json({
      errors: [
        {
          message: '时区不合法'
        }
      ]
    })
    return
  }

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
        strictSeparator: true
      }
    },
    // endTime
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

  const errors = utils.checkForm(
    {
      startTime,
      endTime
    },
    rule
  )
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const startDate = moment(startTime)
  const endDate = moment(endTime)

  // 数据是否超过一定小时数
  let diffHours = endDate.diff(startDate, 'hours')
  let isOverDays = false
  if (diffHours > 72) {
    isOverDays = true
  }

  let offset = null
  let $addFields = {
    formatDate: {
      $dateToString: {
        format: `%Y-%m-%dT%H:00:00.000Z`,
        date: '$createdAt'
      }
    }
  }
  // 如果超过一定天数，就按天数来统计
  if (isOverDays) {
    offset = moment.tz(timeZone).format('Z')
    $addFields = {
      formatDate: {
        $dateToString: {
          format: `%Y-%m-%dT00:00:00.000${offset}`,
          date: '$createdAt',
          timezone: timeZone
        }
      }
    }
  }

  try {
    // 使用单条聚合查询完成所有需求
    const pipeline = [
      // 1. 首先匹配符合条件的文档
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          isBot: false, // 排除机器人访问
          action: 'open',
          'data.performanceNavigationTiming': { $ne: null },
          'data.performanceNavigationTiming.duration': { $ne: null },
          'data.performanceNavigationTiming.duration': { $gt: 0 } // 剔除duration小于等于0的记录
        }
      },
      // 2. 只保留需要的字段，减少内存使用
      {
        $project: {
          ip: 1,
          ipInfo: 1,
          deviceInfo: 1,
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
          _id: '$ip',
          ip: { $first: '$ip' },
          ipInfo: { $first: '$ipInfo' },
          deviceInfo: { $first: '$deviceInfo' },
          performanceNavigationTiming: {
            $first: '$data.performanceNavigationTiming'
          },
          createdAt: { $first: '$createdAt' }
        }
      },
      // 4. 使用$facet分别计算统计数据和获取最快/最慢列表
      {
        $facet: {
          // 统计数据
          stats: [
            {
              $group: {
                _id: null,
                maxDuration: { $max: '$performanceNavigationTiming.duration' },
                minDuration: { $min: '$performanceNavigationTiming.duration' },
                avgDuration: { $avg: '$performanceNavigationTiming.duration' },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                maxDuration: 1,
                minDuration: 1,
                avgDuration: { $round: ['$avgDuration', 0] },
                count: 1
              }
            }
          ],
          // 最慢的数据
          slowestData: [
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
                deviceInfo: 1,
                performanceNavigationTiming: 1,
                createdAt: 1
              }
            }
          ],
          // 最快的数据
          fastestData: [
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
                deviceInfo: 1,
                performanceNavigationTiming: 1,
                createdAt: 1
              }
            }
          ],
          // 按国家统计最慢平均用时
          countrySlowStats: [
            {
              $match: {
                'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' }
              }
            },
            {
              $group: {
                _id: '$ipInfo.countryLong',
                avgDuration: { $avg: '$performanceNavigationTiming.duration' },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gte: 3 } // 只包括至少有3个样本的国家，避免偶然性
              }
            },
            {
              $project: {
                _id: 0,
                country: '$_id',
                avgDuration: { $round: ['$avgDuration', 0] },
                count: 1
              }
            },
            {
              $sort: { avgDuration: -1 } // 从慢到快排序
            },
            {
              $limit: limit
            }
          ],
          // 按国家统计最快平均用时
          countryFastStats: [
            {
              $match: {
                'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' }
              }
            },
            {
              $group: {
                _id: '$ipInfo.countryLong',
                avgDuration: { $avg: '$performanceNavigationTiming.duration' },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gte: 3 } // 只包括至少有3个样本的国家，避免偶然性
              }
            },
            {
              $project: {
                _id: 0,
                country: '$_id',
                avgDuration: { $round: ['$avgDuration', 0] },
                count: 1
              }
            },
            {
              $sort: { avgDuration: 1 } // 从快到慢排序
            },
            {
              $limit: limit
            }
          ],
          // 按国家+地区统计最慢平均用时
          regionSlowStats: [
            {
              $match: {
                'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' },
                'ipInfo.region': { $exists: true, $ne: null, $ne: '-' }
              }
            },
            {
              $group: {
                _id: {
                  country: '$ipInfo.countryLong',
                  region: '$ipInfo.region'
                },
                avgDuration: { $avg: '$performanceNavigationTiming.duration' },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gte: 3 } // 只包括至少有3个样本的地区，避免偶然性
              }
            },
            {
              $project: {
                _id: 0,
                location: {
                  $cond: {
                    if: { $eq: ['$_id.country', '$_id.region'] },
                    then: '$_id.country', // 如果国家和地区相同，只显示一次
                    else: { $concat: ['$_id.country', ' ', '$_id.region'] } // 否则显示国家+空格+地区
                  }
                },
                ipInfo: {
                  countryLong: '$_id.country',
                  region: '$_id.region'
                },
                avgDuration: { $round: ['$avgDuration', 0] },
                count: 1
              }
            },
            {
              $sort: { avgDuration: -1 } // 从慢到快排序
            },
            {
              $limit: limit
            }
          ],
          // 按国家+地区统计最快平均用时
          regionFastStats: [
            {
              $match: {
                'ipInfo.countryLong': { $exists: true, $ne: null, $ne: '-' },
                'ipInfo.region': { $exists: true, $ne: null, $ne: '-' }
              }
            },
            {
              $group: {
                _id: {
                  country: '$ipInfo.countryLong',
                  region: '$ipInfo.region'
                },
                avgDuration: { $avg: '$performanceNavigationTiming.duration' },
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gte: 3 } // 只包括至少有3个样本的地区，避免偶然性
              }
            },
            {
              $project: {
                _id: 0,
                location: {
                  $cond: {
                    if: { $eq: ['$_id.country', '$_id.region'] },
                    then: '$_id.country', // 如果国家和地区相同，只显示一次
                    else: { $concat: ['$_id.country', ' ', '$_id.region'] } // 否则显示国家+空格+地区
                  }
                },
                ipInfo: {
                  countryLong: '$_id.country',
                  region: '$_id.region'
                },
                avgDuration: { $round: ['$avgDuration', 0] },
                count: 1
              }
            },
            {
              $sort: { avgDuration: 1 } // 从快到慢排序
            },
            {
              $limit: limit
            }
          ]
        }
      }
    ]

    // 新增聚合查询，按时间统计平均加载时间
    const timeSeriesPipeline = [
      // 1. 首先匹配符合条件的文档
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          isBot: false, // 排除机器人访问
          action: 'open',
          'data.performanceNavigationTiming': { $ne: null },
          'data.performanceNavigationTiming.duration': { $ne: null },
          'data.performanceNavigationTiming.duration': { $gt: 0 } // 剔除duration小于等于0的记录
        }
      },
      // 2. 添加格式化的日期字段
      {
        $addFields
      },
      // 3. 按时间单位和IP分组，取每组中duration最大的记录
      {
        $sort: {
          'data.performanceNavigationTiming.duration': -1,
          createdAt: 1
        }
      },
      {
        $group: {
          _id: {
            formatDate: '$formatDate',
            ip: '$ip'
          },
          duration: { $first: '$data.performanceNavigationTiming.duration' }
        }
      },
      // 4. 按时间单位分组，计算平均加载时间
      {
        $group: {
          _id: '$_id.formatDate',
          avgDuration: { $avg: '$duration' },
          count: { $sum: 1 }
        }
      },
      // 使用$project和$round对avgDuration进行四舍五入处理
      {
        $project: {
          _id: 1,
          avgDuration: { $round: ['$avgDuration', 0] },
          count: 1
        }
      },
      // 5. 按时间排序
      {
        $sort: {
          _id: 1
        }
      }
    ]

    // 使用Promise.all并行执行两个聚合查询
    const [result, timeSeriesResult] = await Promise.all([
      readerlogUtils.aggregate(pipeline),
      readerlogUtils.aggregate(timeSeriesPipeline)
    ])

    if (!result || result.length === 0) {
      res.status(500).json({
        errors: [
          {
            message: '数据库查询错误'
          }
        ]
      })
      return
    }

    // 处理结果数据
    const sendData = {
      stats:
        result[0].stats.length > 0
          ? result[0].stats[0]
          : { maxDuration: 0, minDuration: 0, avgDuration: 0, count: 0 },
      slowestData: result[0].slowestData,
      fastestData: result[0].fastestData,
      countrySlowStats: result[0].countrySlowStats,
      countryFastStats: result[0].countryFastStats,
      regionSlowStats: result[0].regionSlowStats,
      regionFastStats: result[0].regionFastStats,
      timeSeriesData: [],
      isOverDays
    }

    // 生成完整的时间序列，缺失的数据填充null
    let timeSeriesData = []
    if (!isOverDays) {
      // 按小时统计
      const hoursDifference = endDate.diff(startDate, 'hours')
      for (let i = 0; i <= hoursDifference; i++) {
        const time = startDate
          .clone()
          .tz(timeZone)
          .add(i, 'hours')
          .utc()
          .format('YYYY-MM-DDTHH:00:00.000[Z]')
        const found = timeSeriesResult.find(item => item._id === time)
        timeSeriesData.push({
          time,
          avgDuration: found ? found.avgDuration : null,
          count: found ? found.count : null
        })
      }
    } else {
      // 按天统计
      const daysOfYear = endDate.diff(startDate, 'days')
      for (let i = 0; i <= daysOfYear; i++) {
        const time = startDate
          .clone()
          .tz(timeZone)
          .add(i, 'days')
          .format(`YYYY-MM-DDT00:00:00.000${offset}`)
        const found = timeSeriesResult.find(item => item._id === time)
        timeSeriesData.push({
          time,
          avgDuration: found ? found.avgDuration : null,
          count: found ? found.count : null
        })
      }
    }

    // 添加时间序列数据到返回结果
    sendData.timeSeriesData = timeSeriesData

    // 发送响应
    res.send(sendData)
  } catch (error) {
    console.error(error)
    adminApiLog.error(error)
    res.status(500).json({
      errors: [
        {
          message: '服务器内部错误'
        }
      ]
    })
  }
}
