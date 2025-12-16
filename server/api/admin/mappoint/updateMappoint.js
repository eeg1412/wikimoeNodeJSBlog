const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { title, summary, longitude, latitude, zIndex, status, id, __v } =
    req.body
  // 校验格式
  const params = {
    title,
    summary,
    longitude,
    latitude,
    zIndex: zIndex || 0,
    status
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      strict: true,
      strictType: 'number',
      required: true
    },
    {
      key: 'title',
      label: '标题',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'longitude',
      label: '经度',
      type: 'isFloat',
      required: true,
      strict: true,
      strictType: 'number'
    },
    {
      key: 'latitude',
      label: '纬度',
      type: 'isFloat',
      required: true,
      strict: true,
      strictType: 'number'
    },
    {
      key: 'summary',
      label: '简评',
      type: null,
      required: false,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'zIndex',
      label: '层叠顺序',
      type: 'isInt',
      options: { min: 0, max: 99999999 },
      required: true,
      strict: true,
      strictType: 'number'
    },
    {
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: true,
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
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
