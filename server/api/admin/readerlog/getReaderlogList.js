const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, ip, uuid, isBot, actionList } = req.query
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

  if (actionList) {
    // 判断action是否合法
    const validActions = [
      'open',
      'postList',
      'postListArchive',
      'postListSort',
      'postListTag',
      'postListMappoint',
      'postListBangumi',
      'postListMovie',
      'postListBook',
      'postListGame',
      'postListKeyword',
      'postView',
      'postShare',
      'postLike',
      'postDislike',
      'commentLike',
      'commentDislike',
      'commentRetract'
    ]
    const isValid = actionList.every(action => validActions.includes(action))
    if (!isValid) {
      res.status(400).json({
        errors: [
          {
            message: 'action参数错误'
          }
        ]
      })
      return
    }
    params.action = {
      $in: actionList
    }
  }

  if (ip) {
    ip = utils.escapeSpecialChars(ip)
    params.ip = new RegExp(ip, 'i')
  }
  if (uuid) {
    uuid = utils.escapeSpecialChars(uuid)
    params.uuid = new RegExp(uuid, 'i')
  }
  if (isBot === '0' || isBot === '1') {
    params.isBot = isBot === '1' ? true : false
  }

  const sort = {
    _id: -1
  }
  readerlogUtils
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
            message: '读者操作日志列表获取失败'
          }
        ]
      })
      adminApiLog.error(`readerlog list get fail, ${JSON.stringify(err)}`)
    })
}
