const naviUtils = require('../../../mongodb/utils/navis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // naviname: {
  //   type: String,
  //   required: true,
  // },
  // url: {
  //   type: String,
  // },
  // newtab: {
  //   type: Boolean,
  //   default: false
  // },
  // // 状态 0 不显示 1 显示
  // status: {
  //   type: Number,
  //   default: 0
  // },
  // // 排序
  // taxis: {
  //   type: Number,
  //   default: 0
  // },
  // // 父导航
  // parent: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'navis'
  // },
  // // 是否本站链接
  // isdefault: {
  //   type: Boolean,
  //   default: false
  // },
  // // query
  // query: {
  //   // object
  //   type: Object,
  //   default: {}
  // },
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
  // 校验格式
  const params = {
    naviname,
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
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  naviUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`navi create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '导航创建失败'
      }]
    })
    adminApiLog.error(`navi create fail, ${JSON.stringify(err)}`)
  })

}
