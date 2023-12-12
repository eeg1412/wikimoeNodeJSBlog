const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  const params = {
    name: {
      $in: [
        'siteTitle',
        'siteSubTitle',
        'siteLogo',
        'siteDescription',
        'siteKeywords',
        'siteUrl',
        'sitePageSize',
        'siteEnableComment',
        'siteEnableCommentReview',
        'siteCommentPageSize',
      ]
    }
  }

  optionUtils.find(params).then((data) => {
    // 返回格式list,total
    res.send({
      data
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '配置项列表获取失败'
      }]
    })
    adminApiLog.error(`option list get fail, ${JSON.stringify(err)
      }`)
  })
}
