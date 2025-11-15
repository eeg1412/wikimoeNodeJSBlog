const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const { Worker } = require('worker_threads')
const fs = require('fs')
const moment = require('moment')
const cacheDataUtils = require('../../../config/cacheData')
const globalConfigUtils = require('../../../config/globalConfig')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')

module.exports = async function (req, res, next) {
  const id = req.body.id
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
  // 查询有没有状态为0的备份
  const backingData = await backupUtils.findOne({ status: 0 }).catch(err => {
    return 0
  })
  if (backingData === 0 || backingData) {
    res.status(400).json({
      errors: [
        {
          message: '有备份正在进行中，请稍后再试'
        }
      ]
    })
    return
  }
  // findOne
  backupUtils
    .findOne({ _id: id })
    .then(data => {
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '备份不存在'
            }
          ]
        })
        return
      }
      // 校验备份文件在数据库的状态
      if (data.fileStatus !== 1) {
        res.status(400).json({
          errors: [
            {
              message: '备份文件状态不正确'
            }
          ]
        })
        return
      }
      const fullPath = `./backups/${data.filename}`
      // 检查备份文件是否存在
      if (!fs.existsSync(fullPath)) {
        res.status(400).json({
          errors: [
            {
              message: '备份文件不存在'
            }
          ]
        })
        return
      }
      // 创建还原记录
      backupUtils
        .save({
          name: `【${data.name}】的还原`,
          type: 2,
          fileStatus: 2,
          remark: `在${moment().format('YYYY-MM-DD HH:mm:ss')}还原了备份【${
            data.name
          }】`
        })
        .then(async restoreData => {
          res.send({})

          // 5秒后开始，还原备份，给前端响应时间
          await utils.sleep(5000)
          global.$isReady = false
          // 更新备份文件状态
          // 开始还原
          const restoreWorker = new Worker('./utils/workers/restoreWorker.js')
          restoreWorker.postMessage(fullPath)
          restoreWorker.on('message', async message => {
            const _id = restoreData._id
            if (message.status === 'success') {
              // 成功
              backupUtils
                .updateOne(
                  { _id },
                  {
                    status: 1
                  }
                )
                .then(() => {
                  adminApiLog.info(`restore backup success`)
                })
                .catch(err => {
                  adminApiLog.error(
                    `restore backup success, ${logErrorToText(err)}`
                  )
                })
            } else {
              // 失败
              backupUtils
                .updateOne(
                  {
                    _id
                  },
                  {
                    status: 2,
                    reason: message.error
                  }
                )
                .then(() => {
                  adminApiLog.error(
                    `restore backup fail, ${logErrorToText(message.error)}`
                  )
                })
                .catch(err => {
                  adminApiLog.error(
                    `restore backup fail, ${logErrorToText(err)}`
                  )
                })
              adminApiLog.error(
                `restore backup fail, ${logErrorToText(message.error)}`
              )
            }
            // 关闭 worker
            restoreWorker
              .terminate()
              .then(() => {
                console.log('Worker terminated')
                global.$isReady = true
              })
              .catch(err => {
                global.$isReady = true
                adminApiLog.error(`restore backup fail, ${logErrorToText(err)}`)
              })
            // 重新加载缓存
            // 更新时注意同时更新初始化数据库的地方
            await globalConfigUtils.initGlobalConfig()
            cacheDataUtils.getNaviList()
            cacheDataUtils.getSidebarList()
            cacheDataUtils.getBannerList()
            cacheDataUtils.getSortList()
            cacheDataUtils.getPostArchiveList()
            cacheDataUtils.getBangumiYearList()
            cacheDataUtils.getMovieYearList()
            rssToolUtils.reflushRSS()
            sitemapToolUtils.reflushSitemap()
          })

          adminApiLog.info(`restore backup`)
        })
        .catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '备份还原失败'
              }
            ]
          })
          adminApiLog.error(`restore backup fail, ${logErrorToText(err)}`)
        })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '备份详情获取失败'
          }
        ]
      })
      adminApiLog.error(`backup get fail, ${logErrorToText(err)}`)
    })
}
