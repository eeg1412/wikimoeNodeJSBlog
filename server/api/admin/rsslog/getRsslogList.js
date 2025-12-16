const rsslogUtils = require('../../../mongodb/utils/rsslogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, ip, rssPath, reader } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size
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
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({
      errors: queryErrors
    })
    return
  }
  const params = {}

  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (rssPath) {
    params.rssPath = rssPath
  }
  if (reader) {
    reader = utils.escapeSpecialChars(reader)
    params.reader = new RegExp(reader, 'i')
  }

  const sort = {
    _id: -1
  }
  rsslogUtils
    .findPage(params, sort, page, size)
    .then(data => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: 'RSS访问记录列表获取失败'
          }
        ]
      })
      adminApiLog.error(`rsslog list get fail, ${JSON.stringify(err)}`)
    })
}
