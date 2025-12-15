const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const fsEX = require('fs-extra')
const path = require('path')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  let { page, size, keyword } = req.query
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
    const regex = new RegExp(keyword, 'i')
    params.$or = [{ name: regex }, { remark: regex }]
  }

  const sort = {
    _id: -1
  }
  backupUtils
    .findPage(params, sort, page, size)
    .then(async data => {
      const list = data.list
      // 查找list中fileStatus为1且存在filename的数据，然后根据filename去查找文件是否存在
      const basePath = './backups/'

      // 检查文件是否存在，如果不存在则在返回数据中修改fileStatus为99
      for (const item of list) {
        if (item.fileStatus === 1 && item.filename) {
          const filePath = path.join(basePath, item.filename)
          try {
            const fileExists = await fsEX.pathExists(filePath)
            if (!fileExists) {
              // 文件不存在，只修改返回数据中的fileStatus为99
              item.fileStatus = 99
            }
          } catch (error) {
            adminApiLog.error(
              `check ${filePath} error: ${logErrorToText(error)}`
            )
            // 出错时也标记为文件不存在
            item.fileStatus = 98
          }
        }
      }

      // 返回格式list,total
      res.send({
        list: list,
        total: data.total
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '备份列表获取失败'
          }
        ]
      })
      adminApiLog.error(`backup list get fail, ${logErrorToText(err)}`)
    })
}
