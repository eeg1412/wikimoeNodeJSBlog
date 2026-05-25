const optionUtils = require('../../../mongodb/utils/options')
const utils = require('../../../utils/utils')
const rssToolUtils = require('../../../utils/rss')
const sitemapToolUtils = require('../../../utils/sitemap')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const globalConfigUtils = require('../../../config/globalConfig')
const cacheDataUtils = require('../../../config/cacheData')
const { isSupportedLanguageCode } = require('../../../config/languages')

function sendOptionValidateError(res, message) {
  res.status(400).json({
    errors: [
      {
        message
      }
    ]
  })
}

function validateOptionList(optionList, res) {
  if (!Array.isArray(optionList)) {
    sendOptionValidateError(res, '配置项列表格式无效')
    return false
  }

  for (const item of optionList) {
    const { name, value } = item

    if (name === 'siteDefaultLanguage') {
      if (!isSupportedLanguageCode(value)) {
        sendOptionValidateError(res, '默认站点语言不在支持的语言列表中')
        return false
      }
    }

    if (name === 'siteEnableMultilingual') {
      const isValidBooleanValue =
        value === true ||
        value === false ||
        value === 'true' ||
        value === 'false'
      if (!isValidBooleanValue) {
        sendOptionValidateError(res, '开启多语言配置值无效')
        return false
      }
    }
  }

  return true
}

module.exports = async function (req, res, next) {
  const optionList = req.body.optionList || []
  if (!validateOptionList(optionList, res)) {
    return
  }

  const resList = []
  // optionList 为name 和 value 的数组,name是必须的
  // for await 遍历数组
  for await (const item of optionList) {
    let { name, value } = item
    // 如果name不存在,则跳过
    if (!name) continue
    const base64Reg = /^data:image\/\w+;base64,/
    switch (name) {
      case 'siteLogo':
      case 'siteDarkLogo':
      case 'siteDefaultCover':
      case 'siteFavicon':
        // 判断value是否是base64
        if (base64Reg.test(value)) {
          // 转换成图片并储存
          const path = './public/upload/siteImg/'
          const fileName = name
          try {
            const imgRes = utils.base64ToFile(value, path, fileName, {
              createDir: true
            })
            value = `/upload/siteImg/${imgRes.fileNameAll}?v=${Date.now()}`
          } catch (error) {
            res.status(400).json({
              errors: [
                {
                  message: '照片上传失败'
                }
              ]
            })
            // 写入日志
            adminApiLog.error(`logo update fail, ${JSON.stringify(error)}`)
            throw new Error(error)
          }
        }
        break

      default:
        break
    }
    // findoneAndUpdate
    const dbOptions = { upsert: true, new: true }
    await optionUtils
      .findOneAndUpdate({ name }, { value }, dbOptions)
      .then(data => {
        resList.push(data.toJSON())
        adminApiLog.info(`option update success , ${JSON.stringify(data)}`)
      })
      .catch(err => {
        adminApiLog.error(`option update fail, ${logErrorToText(err)}`)
      })
  }
  await globalConfigUtils.initGlobalConfig()
  cacheDataUtils.getPostArchiveList()
  rssToolUtils.reflushRSS()
  sitemapToolUtils.reflushSitemap()
  // utils.reflushBlogCache()
  // 返回结果
  res.send({
    data: resList
  })
}
