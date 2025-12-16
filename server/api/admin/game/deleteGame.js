const gameUtils = require('../../../mongodb/utils/games')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({ errors: [{ message: 'id格式错误' }] })
    return
  }

  // 删除cover
  // 获取旧数据
  const oldData = await gameUtils.findOne({ _id: id })
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
    let basePath = './public/upload/gameCover/'
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

  //  删除游戏
  gameUtils
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
      // 删除文章下的游戏
      postUtils
        .updateMany(
          {
            $or: [
              {
                gameList: id
              },
              {
                contentGameList: id
              }
            ]
          },
          { $pull: { gameList: id, contentGameList: id } }
        )
        .then(postData => {
          // console.log(postData)
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
          adminApiLog.error(`game delete fail, ${utils.logErrorToText(err)}`)
        })
      cacheDataUtils.getPlayingGameList()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`game delete fail, ${logErrorToText(err)}`)
    })
}
