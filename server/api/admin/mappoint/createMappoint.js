const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { title, summary, longitude, latitude, zIndex, status } = req.body
  // 校验格式
  const params = {
    title: title,
    summary: summary,
    longitude: longitude,
    latitude: latitude,
    zIndex: zIndex || 0,
    status: status
  }
  const rule = [
    {
      key: 'title',
      label: '标题',
      type: null,
      required: true
    },
    {
      key: 'longitude',
      label: '经度',
      type: 'isFloat',
      required: true
    },
    {
      key: 'latitude',
      label: '纬度',
      type: 'isFloat',
      required: true
    },
    {
      key: 'summary',
      label: '简介',
      type: null,
      required: false
    },
    {
      key: 'zIndex',
      label: '层叠顺序',
      type: 'isInt',
      options: { min: 0 },
      required: true
    },
    {
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 经纬度范围校验
  if (longitude < -180 || longitude > 180) {
    res.status(400).json({
      errors: [
        {
          message: '经度必须在-180到180之间'
        }
      ]
    })
    return
  }
  if (latitude < -90 || latitude > 90) {
    res.status(400).json({
      errors: [
        {
          message: '纬度必须在-90到90之间'
        }
      ]
    })
    return
  }
  // save
  mappointUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`mappoint:${title} create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '地点创建失败'
          }
        ]
      })
      adminApiLog.error(`mappoint:${title} create fail, ${logErrorToText(err)}`)
    })
}
