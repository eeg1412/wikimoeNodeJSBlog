const sidebarUtils = require('../../../mongodb/utils/sidebars')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { _id, title, content, count, status } = req.body
  // 校验格式
  const params = {
    title: title || '',
    content: content || '',
    count: count || 1,
    status: status || 0
  }
  const formCheck = {
    _id,
    ...params
  }
  const rule = [
    {
      key: '_id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: 'title',
      label: '侧边栏名称',
      type: null,
      required: false,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'content',
      label: '侧边栏内容',
      type: null,
      required: false,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'count',
      label: '计数',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  sidebarUtils
    .updateOne({ _id: _id }, params)
    .then(data => {
      // 判断是否更新成功
      if (data.modifiedCount === 0) {
        // 记录
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      // 记录
      adminApiLog.info(`sidebar update success`)
      // 返回
      res.send({
        data: data
      })
      cacheDataUtils.getSidebarList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      // 记录
      adminApiLog.error(`sidebar update fail, ${logErrorToText(err)}`)
      // 报错
      res.status(400).json({
        errors: [
          {
            message: '更新失败'
          }
        ]
      })
    })
}
