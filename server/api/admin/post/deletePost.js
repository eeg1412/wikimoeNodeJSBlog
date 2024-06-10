
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')

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
  //  删除分类
  postUtils.deleteOne({ _id: id }).then((data) => {
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
    cacheDataUtils.getPostArchiveList()
    rssToolUtils.reflushRSS()
    sitemapToolUtils.reflushSitemap()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '删除失败'
      }]
    })
    adminApiLog.error(`post delete fail, ${logErrorToText(err)}`)
  })
}
