const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const albumUtils = require('../../../mongodb/utils/albums')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { ids, albumId } = req.body
  // ids 必须为数组
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      errors: [
        {
          message: '缺少ids'
        }
      ]
    })
    return
  }
  for (const id of ids) {
    if (!utils.isObjectId(id)) {
      res.status(400).json({
        errors: [
          {
            message: 'ids中包含无效的id'
          }
        ]
      })
      return
    }
  }
  const rule = [
    {
      key: 'album',
      label: '媒体名称',
      type: 'isMongoId',
      required: true
    }
  ]
  const params = {
    album: albumId
  }
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  // 获取ids所在的album
  const attachmentList = await attachmentUtils.find({ _id: { $in: ids } })

  // updateMany
  attachmentUtils
    .updateMany({ _id: { $in: ids } }, params)
    .then(async data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      // 更新成功后,更新旧album的count
      // 获取ids对应的album的id
      const albumIds = attachmentList.map(item => {
        return item.album
      })
      // 根据id进行album分类,结构为{albumId: 对应的attachment数量}
      const albumIdMap = {}
      albumIds.forEach(item => {
        if (albumIdMap[item]) {
          albumIdMap[item] += 1
        } else {
          albumIdMap[item] = 1
        }
      })
      // 分别对albumIdMap进行遍历,更新album的count
      const albumUpdatePromise = []
      for (let key in albumIdMap) {
        albumUpdatePromise.push(
          albumUtils.updateOne(
            { _id: key },
            {
              $inc: {
                count: -albumIdMap[key]
              }
            }
          )
        )
      }
      // 更新album的count
      await Promise.all(albumUpdatePromise)
        .then(() => {
          // 更新对象album的count
          const toAlbumParams = {
            $inc: {
              count: ids.length
            }
          }
          // 更新album的count
          albumUtils
            .updateOne({ _id: albumId }, toAlbumParams)
            .then(data => {
              res.send({
                data: data
              })
              adminApiLog.info(`attachment album update success`)
            })
            .catch(err => {
              res.status(400).json({
                errors: [
                  {
                    message: '更新目标相册计数时失败'
                  }
                ]
              })
              adminApiLog.error(
                `attachment album update fail, ${logErrorToText(err)}`
              )
              return
            })
        })
        .catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '更新源相册计数时失败'
              }
            ]
          })
          adminApiLog.error(
            `attachment album update fail, ${logErrorToText(err)}`
          )
          return
        })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '更新失败'
          }
        ]
      })
      adminApiLog.error(`attachment album update fail, ${logErrorToText(err)}`)
    })
}
