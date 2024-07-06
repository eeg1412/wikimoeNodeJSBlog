const sidebarUtils = require('../../../mongodb/utils/sidebars')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')


module.exports = async function (req, res, next) {
  /*
  // 侧边栏名称
  title: { type: String },
  // 侧边栏内容
  content: { type: String },
  // 计数
  count: { type: Number, default: 1 },
  // 1:自定义 3:最新评论 4:标签云 5:随机文章 7:搜索 8:分类
  type: { type: Number, default: 1 },
  // 排序
  taxis: { type: Number, default: 0 },
  // 0:不可见 1:可见
  status: { type: Number, default: 0 },
  */
  const {
    title,
    content,
    count,
    type,
    taxis,
    status
  } = req.body
  // 校验格式
  const params = {
    title: title || '',
    content: content || '',
    count: count || 1,
    type: type || 1,
    taxis: taxis || 0,
    status: status || 0
  }
  const rule = [
    {
      key: 'type',
      label: '侧边栏类型',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 允许创建多个type的列表
  const multipleType = [1, 10, 11]
  // 校验除了multipleType以外的其他侧边栏是否存在
  if (!multipleType.includes(params.type)) {
    const sidebar = await sidebarUtils.findOne({ type: params.type })
    if (sidebar) {
      res.status(400).json({
        errors: [{
          message: '该侧边栏已存在'
        }]
      })
      return
    }
  }
  // save
  sidebarUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`sidebar create success`)
    cacheDataUtils.getSidebarList()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '侧边栏创建失败'
      }]
    })
    adminApiLog.error(`sidebar create fail, ${logErrorToText(err)}`)
  })

}
