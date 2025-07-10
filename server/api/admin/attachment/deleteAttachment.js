const attachmentUtils = require('../../../mongodb/utils/attachments')
const albumUtils = require('../../../mongodb/utils/albums')
const postUtils = require('../../../mongodb/utils/posts')
const userUtils = require('../../../mongodb/utils/users')
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
  // 获取该媒体的信息
  const attachmentData = await attachmentUtils.findOne({ _id: id })
  if (!attachmentData) {
    res.status(400).json({
      errors: [
        {
          message: '媒体不存在'
        }
      ]
    })
    return
  }

  //  删除媒体
  attachmentUtils
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
      // album.count - 1
      albumUtils
        .updateOne(
          { _id: attachmentData.album },
          {
            $inc: {
              count: -1
            }
          }
        )
        .then(data => {
          if (data.modifiedCount === 0) {
            adminApiLog.error(`album:${attachmentData.album} count - 1 fail`)
            res.status(400).json({
              errors: [
                {
                  message: '删除失败'
                }
              ]
            })
            return
          }
          // 删除文件
          const dir = path.join('./public', attachmentData.filepath)
          const thumforDir = path.join('./public', attachmentData.thumfor)
          try {
            fs.unlinkSync(dir)
            if (attachmentData.thumfor) {
              fs.unlinkSync(thumforDir)
            }
          } catch (error) {
            res.status(400).json({
              errors: [
                {
                  message: '删除文件失败'
                }
              ]
            })
            adminApiLog.error(
              `attachment delete file fail, ${JSON.stringify(error)}`
            )
            throw error
          }

          // 删除文章中的引用
          const postPromise = postUtils.updateMany(
            { coverImages: id },
            {
              $pull: {
                coverImages: id
              }
            }
          )
          const userPromise = userUtils.updateMany(
            { cover: id },
            {
              $set: {
                cover: null
              }
            }
          )

          Promise.all([postPromise, userPromise])
            .then(() => {
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
              adminApiLog.error(
                `attachment delete reference fail, ${logErrorToText(err)}`
              )
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
          adminApiLog.error(
            `album:${attachmentData.album} count - 1 fail, ${logErrorToText(err)}`
          )
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
      adminApiLog.error(`attachment delete fail, ${logErrorToText(err)}`)
    })
}
