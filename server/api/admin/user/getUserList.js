const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, idList } = req.query
  page = parseInt(page)
  size = parseInt(size)
  // 判断page和size是否为数字
  if (!utils.isNumber(page) || !utils.isNumber(size)) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误',
        },
      ],
    })
    return
  }
  const params = {}
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    // 查询 username 和 nickname 字段
    params.$or = [
      {
        username: new RegExp(keyword, 'i'),
      },
      {
        nickname: new RegExp(keyword, 'i'),
      },
    ]
  }
  if (idList) {
    params._id = { $in: idList }
  }

  const sort = {
    _id: -1,
  }
  userUtils
    .findPage(params, sort, page, size, '-password')
    .then((data) => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '管理员列表获取失败',
          },
        ],
      })
      adminApiLog.error(`admin list get fail, ${JSON.stringify(err)}`)
    })
}
