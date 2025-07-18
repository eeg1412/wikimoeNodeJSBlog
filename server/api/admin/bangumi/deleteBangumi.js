const bangumiUtils = require('../../../mongodb/utils/bangumis')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
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
  // 删除cover
  // 获取旧数据
  const oldData = await bangumiUtils.findOne({ _id: id })
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
  // 删除cover
  if (oldData.coverFileName) {
    const coverFolder = oldData.coverFolder
    let basePath = './public/upload/bangumi/'
    // 拼接文件夹
    basePath = basePath + coverFolder + '/'
    let fileName = oldData.coverFileName
    // 删除旧图片
    try {
      const oldPath = path.join(basePath, fileName)
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

  //  删除番剧
  bangumiUtils
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
      // 删除文章下的番剧
      postUtils
        .updateMany(
          {
            $or: [
              {
                bangumiList: id
              },
              {
                contentBangumiList: id
              }
            ]
          },
          { $pull: { bangumiList: id, contentBangumiList: id } }
        )
        .then(data => {
          // console.log('data', data)
          res.send({
            data: {
              message: '删除成功'
            }
          })
        })
        .catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '删除失败'
              }
            ]
          })
          adminApiLog.error(`bangumi delete fail, ${logErrorToText(err)}`)
        })
      cacheDataUtils.getBangumiYearList()
      cacheDataUtils.getBangumiSeasonList()
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
      adminApiLog.error(`bangumi delete fail, ${logErrorToText(err)}`)
    })
}
