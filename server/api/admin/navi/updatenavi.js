const naviUtils = require('../../../mongodb/utils/navis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {
  const { id, __v } = req.body
  const {
    naviname,
    url,
    newtab,
    status,
    taxis,
    parent,
    isdefault,
    query
  } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // parent 不能和 id 相同
  if (parent === id) {
    res.status(400).json({
      errors: [{
        message: '父级不能和自己相同'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    naviname: naviname,
    url,
    newtab: newtab || false,
    status: status || 0,
    taxis: taxis || 0,
    parent: parent || null,
    isdefault: isdefault || false,
    query: query || {}
  }
  const rule = [
    {
      key: 'naviname',
      label: '导航名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  naviUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`navi update success`)
    cacheDataUtils.getNaviList()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '导航更新失败'
      }]
    })
    adminApiLog.error(`navi update fail, ${JSON.stringify(err)}`)
  })
}
