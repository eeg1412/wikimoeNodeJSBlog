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
    deepmatch,
    query
  } = req.body
  // 校验格式
  const params = {
    naviname,
    url,
    newtab: newtab ? true : false,
    status: status || 0,
    taxis: taxis || 0,
    parent: parent || null,
    isdefault: isdefault ? true : false,
    deepmatch: deepmatch ? true : false,
    query: query || ''
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
      key: 'naviname',
      label: '导航名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'parent',
      label: '父导航',
      type: 'isMongoId',
      required: false
    },
    {
      key: 'newtab',
      label: '新标签页',
      strict: true,
      strictType: 'boolean'
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'taxis',
      label: '排序',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'isdefault',
      label: '本站链接',
      strict: true,
      strictType: 'boolean'
    },
    {
      key: 'deepmatch',
      label: '深度匹配',
      strict: true,
      strictType: 'boolean'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // parent 不能和 id 相同
  if (parent === id) {
    res.status(400).json({
      errors: [
        {
          message: '父级不能和自己相同'
        }
      ]
    })
    return
  }
  // updateOne
  naviUtils
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
      adminApiLog.info(`navi update success`)
      cacheDataUtils.getNaviList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '导航更新失败'
          }
        ]
      })
      adminApiLog.error(`navi update fail, ${logErrorToText(err)}`)
    })
}
