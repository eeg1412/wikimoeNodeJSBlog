const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const bannerList = req.body.bannerList
  // 循环sidebarList
  const promises = []
  bannerList.forEach(item => {
    const { _id, taxis } = item
    if (!utils.isObjectId(_id)) {
      return
    }
    const params = {
      taxis: taxis || 0
    }
    const rule = [
      {
        key: 'taxis',
        label: '排序',
        strict: true,
        strictType: 'number'
      }
    ]
    const errors = utils.checkForm(params, rule)
    if (errors.length > 0) {
      return
    }
    // updateOne
    const updatePromise = new Promise((resolve, reject) => {
      bannerUtils
        .updateOne({ _id: _id }, params)
        .then(data => {
          // 判断是否更新成功
          if (data.modifiedCount === 0) {
            reject({
              message: '更新失败'
            })
            return
          }
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
    promises.push(updatePromise)
  })
  // Promise.all
  Promise.all(promises)
    .then(data => {
      res.send({
        data: data,
        successCount: data.length
      })
      adminApiLog.info(`banner update success`)
      cacheDataUtils.getBannerList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '横幅更新失败'
          }
        ]
      })
      adminApiLog.error(`banner update fail, ${logErrorToText(err)}`)
    })
}
