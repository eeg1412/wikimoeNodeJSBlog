const naviUtils = require('../mongodb/utils/navis')
const sidebarUtils = require('../mongodb/utils/sidebars')
const bannerUtils = require('../mongodb/utils/banners')
const sortUtils = require('../mongodb/utils/sorts')
const commentUtils = require('../mongodb/utils/comments')

const utils = require('../utils/utils')

exports.getNaviList = async function (req, res, next) {
  console.info('naviList get')
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

exports.getSortList = async function (req, res, next) {
  console.info('sortList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    sortUtils.find({}, sort).then((data) => {
      // 根据返回的data，配合parent字段，生成树形结构
      const jsonData = data.map(doc => doc.toJSON())
      const treeData = utils.generateTreeData(jsonData)
      global.$cacheData.sortList = treeData
      resolve(treeData)
      console.info('sortList get success')
    }).catch((err) => {
      global.$cacheData.sortList = null
      reject(err)
      console.error('sortList get fail')
    })
  })
  return promise
}

exports.getSidebarList = async function (req, res, next) {
  console.info('sidebarList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = await new Promise((resolve, reject) => {
    sidebarUtils.find({ status: 1 }, sort).then((data) => {
      global.$cacheData.sidebarList = data
      resolve(data)
      // 更新 getCommentList
      this.getCommentList()
      console.info('sidebarList get success')
    }).catch((err) => {
      global.$cacheData.sidebarList = null
      reject(err)
      console.error('sidebarList get fail')
    })
  })
  return promise
}

exports.getBannerList = async function (req, res, next) {
  console.info('bannerList get')
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

// 获取最新评论列表,根据date
exports.getCommentList = async function (req, res, next) {
  console.info('commentList get')
  // 查询global.$cacheData.sidebarList里type为3的侧边栏
  const sidebarList = global.$cacheData.sidebarList || []
  const commentSidebar = sidebarList.find((item) => {
    return item.type === 3
  })
  // 不存在type为3的侧边栏
  if (!commentSidebar) {
    global.$cacheData.commentList = null
    // reject
    promise.reject()
    return
  }
  // 存在type为3的侧边栏,获取count
  const count = commentSidebar.count || 0
  // 如果count小于等于0，不获取最新评论列表
  if (count <= 0) {
    global.$cacheData.commentList = null
    // reject
    promise.reject()
    return
  }
  const sort = {
    date: -1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    commentUtils.findPage({ status: 1 }, sort, 1, count, 'status _id').then((data) => {
      let list = JSON.parse(JSON.stringify(data.list))
      // 需要获取的key数组
      const keys = ['_id', 'avatar', 'content', 'date', 'nickname', 'url', 'post', 'likes', 'isAdmin']
      // 去掉post.status不为1的list项
      list = list.filter((item) => {
        return item.post && item.post.status === 1
      })

      // 将list的email字段替换为gravatar头像
      list.forEach((item) => {
        const email = item.email || item.nickname
        if (email) {
          item.avatar = utils.md5hex(email)
        }
        if (item.user) {
          item.avatar = item.user.photo
          item.nickname = item.user.nickname
          item.isAdmin = true
        } else {
          item.isAdmin = false
        }
        // 只保留需要的key
        Object.keys(item).forEach((key) => {
          if (!keys.includes(key)) {
            delete item[key]
          }
        })
      })
      global.$cacheData.commentList = list
      resolve(list)
      console.info('commentList get success')
    }).catch((err) => {
      global.$cacheData.commentList = null
      reject(err)
      console.error('commentList get fail')
    })
  })
  return promise
}