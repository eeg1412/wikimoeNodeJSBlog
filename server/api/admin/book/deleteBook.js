const bookUtils = require('../../../mongodb/utils/books')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

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

  // 删除cover
  // 获取旧数据
  const oldData = await bookUtils.findOne({ _id: id })
  if (!oldData) {
    res.status(400).json({
      errors: [{
        message: '该数据不存在'
      }]
    })
    return
  }
  // 删除cover
  if (oldData.coverFileName) {
    const coverFolder = oldData.coverFolder
    let basePath = './public/upload/bookCover/'
    // 拼接文件夹
    basePath = basePath + coverFolder + '/'
    let fileName = oldData.coverFileName
    // 删除旧图片
    try {
      const oldPath = path.join(basePath, fileName)
      fs.unlinkSync(oldPath)
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '旧图片删除失败'
        }]
      })
      throw new Error(error)
    }
  }
  //  删除书籍
  bookUtils.deleteOne({ _id: id }).then((data) => {
    if (data.deletedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '删除失败'
        }]
      })
      return
    }
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
    adminApiLog.error(`book delete fail, ${logErrorToText(err)}`)
  })
}