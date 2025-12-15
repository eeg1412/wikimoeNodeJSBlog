const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword, album, typeList, is360Panorama } = req.query
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
    res.status(400).json({ errors: queryErrors })
    return
  }
  const params = {}
  if (is360Panorama === 'true') {
    params.is360Panorama = true
  }
  // 如果keyword存在，就加入查询条件
  if (keyword) {
    keyword = utils.escapeSpecialChars(keyword)
    params.name = new RegExp(keyword, 'i')
  }
  if (album) {
    if (!utils.isObjectId(album)) {
      res.status(400).json({
        errors: [
          {
            message: 'album格式错误'
          }
        ]
      })
      return
    }
    params.album = album
  }
  // 如果typeList是数组，就加入查询条件
  if (typeList && Array.isArray(typeList)) {
    // 针对mimetype进行查询,注意数据库中存储的是image/jpeg这种格式,但是typeList是image,video
    const typeListReg = typeList.map(item => {
      return new RegExp(item, 'i')
    })
    params.mimetype = {
      $in: typeListReg
    }
  }

  // updatedAt越新越靠前，_id越新越靠前
  const sort = {
    updatedAt: -1,
    _id: -1
  }
  attachmentUtils
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
            message: '媒体列表获取失败'
          }
        ]
      })
      adminApiLog.error(`attachment list get fail, ${logErrorToText(err)}`)
    })
}
