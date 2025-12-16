const referrerUtils = require('../../../mongodb/utils/referrers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, referrerType } = req.query
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
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.referrer = new RegExp(keyword, 'i')
  }

  if (referrerType) {
    // 校验referrerType是否合法
    const referrerTypes = ['assets', 'adminApi', 'blogApi']
    if (!referrerTypes.includes(referrerType)) {
      res.status(400).json({
        errors: [
          {
            message: '参数错误'
          }
        ]
      })
      return
    }
    params.referrerType = referrerType
  }

  const sort = {
    _id: -1
  }
  referrerUtils
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
            message: '引用记录列表获取失败'
          }
        ]
      })
      adminApiLog.error(`referrer list get fail, ${JSON.stringify(err)}`)
    })
}
