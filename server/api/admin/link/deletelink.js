const linkUtils = require('../../../mongodb/utils/links')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }
  // 删除icon
  // 获取旧数据
  const oldData = await linkUtils.findOne({ _id: id })
  if (!oldData) {
    res.status(400).json({
      errors: [
        {
          message: '该数据不存在'
        }
      ]
    })
    return
  }
  // 删除icon
  if (oldData.iconPath) {
    // 删除旧图片
    try {
      const oldPath = path.join('./', oldData.iconPath)
      fs.unlinkSync(oldPath)
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '旧图片删除失败'
          }
        ]
      })
      throw new Error(error)
    }
  }

  //  删除友链
  linkUtils
    .deleteOne({ _id: id })
    .then(data => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败'
            }
          ]
        })
        return
      }
      res.send({
        data: {
          message: '删除成功'
        }
      })
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`link delete fail, ${logErrorToText(err)}`)
    })
}
