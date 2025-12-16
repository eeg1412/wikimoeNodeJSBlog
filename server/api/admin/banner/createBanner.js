const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const { title, taxis, link } = req.body
  // 校验格式
  const params = {
    title: title || '',
    taxis: taxis || 0,
    link: link || ''
  }
  const rule = [
    {
      key: 'title',
      label: '标题',
      strict: true,
      strictType: 'string'
    },
    {
      key: 'taxis',
      label: '排序',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'link',
      label: '链接',
      strict: true,
      strictType: 'string'
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  bannerUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`banner create success`)
      cacheDataUtils.getBannerList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '横幅创建失败'
          }
        ]
      })
      adminApiLog.error(`banner create fail, ${logErrorToText(err)}`)
    })
}
