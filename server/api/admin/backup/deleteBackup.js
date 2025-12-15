const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const fsEX = require('fs-extra')
var path = require('path')

module.exports = async function (req, res, next) {
  const id = req.query.id
  const deletefile = req.query.deletefile
  const deleterecord = req.query.deleterecord
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }
  const backup = await backupUtils.findOne({ _id: id })
  if (!backup) {
    res.status(400).json({
      errors: [
        {
          message: '备份不存在'
        }
      ]
    })
    return
  }
  // deletefile 和 deleterecord 至少有一个为1
  if (deletefile !== '1' && deleterecord !== '1') {
    res.status(400).json({
      errors: [
        {
          message: '参数错误'
        }
      ]
    })
    return
  }
  if (deletefile === '1') {
    if (backup) {
      let basePath = './backups/'
      // 如果不存在 backup.filename 报错
      if (!backup.filename) {
        res.status(400).json({
          errors: [
            {
              message: '备份文件不存在'
            }
          ]
        })
        return
      }
      const fullPath = path.join(basePath, backup.filename)
      try {
        fs.unlinkSync(fullPath)
      } catch (err) {
        res.status(400).json({
          errors: [
            {
              message: `删除文件失败, ${logErrorToText(err)}`
            }
          ]
        })
        adminApiLog.error(`backup delete file fail, ${logErrorToText(err)}`)
        return
      }
      // 更新备份记录
      try {
        const data = await backupUtils.updateOne({ _id: id }, { fileStatus: 2 })
        if (data.nModified === 0) {
          res.status(400).json({
            errors: [
              {
                message: '删除文件成功, 但更新记录失败'
              }
            ]
          })
          return
        }
      } catch (err) {
        res.status(400).json({
          errors: [
            {
              message: '删除文件成功, 但更新记录失败'
            }
          ]
        })
        adminApiLog.error(
          `backup delete file success, but update record fail, ${logErrorToText(
            err
          )}`
        )
        return
      }
    } else {
      res.status(400).json({
        errors: [
          {
            message: '备份不存在'
          }
        ]
      })
      return
    }
  }
  if (backup.status === 3) {
    // 待上传的备份，需要删除缓存文件
    const cacheDir = `./cache/${backup._id}`
    // 如果存在 cacheDir 则删除
    if (fs.existsSync(cacheDir)) {
      try {
        await fsEX.remove(cacheDir)
      } catch (err) {
        res.status(400).json({
          errors: [
            {
              message: '删除缓存文件失败'
            }
          ]
        })
        adminApiLog.error(
          `backup delete cache file fail, ${logErrorToText(err)}`
        )
        return
      }
    }
  }
  if (deleterecord === '1') {
    //  删除备份
    try {
      const data = await backupUtils.deleteOne({ _id: id })
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
    } catch (err) {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`backup delete fail, ${logErrorToText(err)}`)
      return
    }
  }
  res.send({
    data: {
      message: '删除成功'
    }
  })
}
