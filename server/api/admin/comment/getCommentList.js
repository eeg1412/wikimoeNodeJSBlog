const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, ip, uuid, status } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size,
    keyword,
    ip,
    uuid,
    status
  }
  const queryRule = [
    {
      key: 'page',
      label: '页数',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'size',
      label: '每页数量',
      strict: true,
      strictType: 'number',
      type: 'isInt',
      options: {
        min: 1
      },
      required: true
    },
    {
      key: 'keyword',
      label: '关键词',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'ip',
      label: 'IP',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'uuid',
      label: 'UUID',
      strict: true,
      strictType: 'string',
      required: false
    },
    {
      key: 'status',
      label: '状态',
      type: 'isInt',
      required: false
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({ errors: queryErrors })
    return
  }
  const params = {}
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.$or = [
      { content: new RegExp(keyword, 'i') },
      { nickname: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') },
      { url: new RegExp(keyword, 'i') }
    ]
  }
  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (uuid) {
    uuid = utils.escapeSpecialChars(uuid)
    params.uuid = new RegExp(uuid, 'i')
  }
  // 因为是query，所以要转换成数字
  if (status) {
    params.status = Number(status)
  }
  const sort = {
    date: -1
  }
  commentUtils
    .findPage(params, sort, page, size)
    .then(data => {
      // 返回格式list,total
      const list = data.list.map(item => {
        const newItem = item.toJSON()
        newItem.parentId = item.populated('parent')
        return newItem
      })
      res.send({
        list: list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '评论列表获取失败'
          }
        ]
      })
      adminApiLog.error(`comment list get fail, ${logErrorToText(err)}`)
    })
}
