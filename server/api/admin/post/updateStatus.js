const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')

module.exports = async function (req, res, next) {
  const { id, action } = req.body
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

  const params = {
    lastChangDate: new Date()
  }

  switch (action) {
    case 'publishWithCurrentTime':
      params.status = 1
      params.date = new Date()
      break
    case 'publish':
      params.status = 1
      break
    case 'setDraft':
      params.status = 0
      break
    default:
      res.status(400).json({
        errors: [
          {
            message: '无效的操作'
          }
        ]
      })
      return
  }

  postUtils
    .updateOne({ _id: id }, params)
    .then(data => {
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
      res.send({
        data: data
      })
      adminApiLog.info(`post update status success`)
      cacheDataUtils.getPostArchiveList()
      rssToolUtils.reflushRSS()
      sitemapToolUtils.reflushSitemap()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '更新文章状态失败'
          }
        ]
      })
      adminApiLog.error(`post update status fail, ${err.message}`)
    })
}
