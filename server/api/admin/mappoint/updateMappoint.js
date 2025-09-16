const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { title, summary, longitude, latitude, zIndex, status, id, __v } =
    req.body
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [
        {
          message: '__v不能为空'
        }
      ]
    })
    return
  }
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
      label: '简评',
      type: null,
      required: false
    },
    {
      key: 'zIndex',
      label: '层叠顺序',
      type: 'isInt',
      options: { min: 0, max: 99999999 },
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
  // updateOne
  mappointUtils
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
      adminApiLog.info(`mappoint:${title} update success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '地点更新失败'
          }
        ]
      })
      adminApiLog.error(`mappoint:${title} update fail, ${logErrorToText(err)}`)
    })
}
