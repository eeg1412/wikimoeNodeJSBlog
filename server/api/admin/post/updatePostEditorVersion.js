const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const tagUtils = require('../../../mongodb/utils/tags')
const adminApiLog = log4js.getLogger('adminApi')
const validator = require('validator')
const cacheDataUtils = require('../../../config/cacheData')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')

module.exports = async function (req, res, next) {
  const id = req.body.id
  let { __v } = req.body

  const params = { id, __v }
  const rule = [
    { key: 'id', label: 'id', type: 'isMongoId', required: true },
    {
      key: '__v',
      label: '__v',
      required: true,
      strict: true,
      strictType: 'number'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const updateData = {
    editorVersion: 5,
    content: '',
    status: 0,
    lastChangDate: new Date()
  }
  // 更新
  postUtils
    .updateOne({ _id: id, __v: __v }, updateData)
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
      adminApiLog.info(`post update success`)
      // 新旧status不一样，更新缓存
      cacheDataUtils.getPostArchiveList()
      rssToolUtils.reflushRSS()
      sitemapToolUtils.reflushSitemap()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '更新文章失败'
          }
        ]
      })
      adminApiLog.error(`post update fail, ${logErrorToText(err)}`)
    })
}
