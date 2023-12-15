const naviUtils = require('../mongodb/utils/navis')
const sidebarUtils = require('../mongodb/utils/sidebars')
const bannerUtils = require('../mongodb/utils/banners')
const utils = require('../utils/utils')

exports.getNaviList = async function (req, res, next) {
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    naviUtils.find({ status: 1 }, sort).then((data) => {
      // 根据返回的data，配合parent字段，生成树形结构
      const jsonData = data.map(doc => doc.toJSON())
      const treeData = utils.generateTreeData(jsonData)
      global.$cacheData.naviList = treeData
      resolve(treeData)
      console.info('naviList get success')
    }).catch((err) => {
      global.$cacheData.naviList = null
      reject(err)
      console.error('naviList get fail')
    })
  })
  return promise
}

exports.getBannerList = async function (req, res, next) {
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    bannerUtils.find({ status: 1 }, sort).then((data) => {
      global.$cacheData.bannerList = data
      resolve(data)
      console.info('bannerList get success')
    }).catch((err) => {
      global.$cacheData.bannerList = null
      reject(err)
      console.error('bannerList get fail')
    })
  })
  return promise
}