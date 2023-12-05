const sidebarUtils = require('../../../mongodb/utils/sidebars')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const sidebarList = req.body.sidebarList || []
  // 循环sidebarList
  const promises = []
  sidebarList.forEach((item) => {
    const {
      _id,
      title,
      content,
      count,
      type,
      taxis,
      status
    } = item
    if (!_id) {
      return
    }
    // 校验格式
    const params = {
      title: title || '',
      content: content || '',
      count: count || 1,
      type: type || 1,
      taxis: taxis || 0,
      status: status || 0
    }
    const rule = [
      {
        key: 'type',
        label: '侧边栏类型',
        type: null,
        required: true,
      },
    ]
    const errors = utils.checkForm(params, rule)
    if (errors.length > 0) {
      return
    }
    // updateOne
    const updatePromise = new Promise((resolve, reject) => {
      sidebarUtils.updateOne({ _id: _id }, params).then((data) => {
        // 判断是否更新成功
        if (data.nModified === 0) {
          reject({
            message: '更新失败'
          })
          return
        }
        resolve(data)
      }).catch((err) => {
        reject(err)
      })
    })
    promises.push(updatePromise)
  })
  Promise.all(promises).then((data) => {
    res.send({
      data: data,
      successCount: data.length
    })
    adminApiLog.info(`sidebar update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '侧边栏更新失败'
      }]
    })
    adminApiLog.error(`sidebar update fail, ${JSON.stringify(err)}`)
  })

}
