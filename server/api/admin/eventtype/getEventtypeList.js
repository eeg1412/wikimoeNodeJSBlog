const eventtypeUtils = require('../../../mongodb/utils/eventtypes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, idList } = req.query
  page = Number(page)
  size = Number(size)
  const queryCheck = {
    page,
    size,
    keyword
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
    }
  ]
  const queryErrors = utils.checkForm(queryCheck, queryRule)
  if (queryErrors.length > 0) {
    res.status(400).json({ errors: queryErrors })
    return
  }
  const params = {}
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.name = new RegExp(keyword, 'i')
  }

  if (idList) {
    // 检查idList是否为数组
    if (!Array.isArray(idList)) {
      res.status(400).json({
        errors: [
          {
            message: 'idList必须为数组'
          }
        ]
      })
      return
    }
    // 检查idList中的id是否合法
    for (let i = 0; i < idList.length; i++) {
      if (!utils.isObjectId(idList[i])) {
        res.status(400).json({
          errors: [
            {
              message: 'idList中包含非法id'
            }
          ]
        })
        return
      }
    }
    params._id = { $in: idList }
  }

  const sort = {
    _id: -1
  }
  eventtypeUtils
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
            message: '活动类型列表获取失败'
          }
        ]
      })
      adminApiLog.error(`eventtype list get fail, ${JSON.stringify(err)}`)
    })
}
