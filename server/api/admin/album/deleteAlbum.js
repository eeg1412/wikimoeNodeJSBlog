const chalk = require('chalk')
const albumUtils = require('../../../mongodb/utils/albums')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path');

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // 判断目录下是否有文件
  const album = await albumUtils.findOne({ _id: id })
  // 根据album.count
  if (album.count > 0) {
    res.status(400).json({
      errors: [{
        message: '相册下面存在文件，不能删除'
      }]
    })
    return
  }
  const dir = path.join('./public/content/uploadfile', album._id.toString())
  const files = fs.readdirSync(dir)
  if (files.length > 0) {
    res.status(400).json({
      errors: [{
        message: '相册下面存在文件，不能删除'
      }]
    })
    return
  }

  //  删除相册
  albumUtils.deleteOne({ _id: id }).then((data) => {
    if (data.deletedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '删除失败'
        }]
      })
      return
    }
    // 删除相册文件夹 /public/content/uploadfile/${id}
    fs.rmdirSync(dir)

    res.send({
      data: {
        message: '删除成功'
      }
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '删除失败'
      }]
    })
    adminApiLog.error(`album delete fail, ${JSON.stringify(err)}`)
  })
}
