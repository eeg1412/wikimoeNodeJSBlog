const naviUtils = require('../mongodb/utils/navis')
const sidebarUtils = require('../mongodb/utils/sidebars')
const bannerUtils = require('../mongodb/utils/banners')
const sortUtils = require('../mongodb/utils/sorts')
const postUtils = require('../mongodb/utils/posts')
const bangumiUtils = require('../mongodb/utils/bangumis')
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
    return []
  }
  // 存在type为3的侧边栏,获取count
  const count = commentSidebar.count || 0
  // 如果count小于等于0，不获取最新评论列表
  if (count <= 0) {
    global.$cacheData.commentList = null
    // reject
    return []
  }
  const sort = {
    date: -1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    commentUtils.findPage({ status: 1 }, sort, 1, count, undefined, { postFilter: 'status _id alias type' }).then((data) => {
      let list = JSON.parse(JSON.stringify(data.list))
      // 需要获取的key数组
      const keys = ['_id', 'avatar', 'content', 'date', 'nickname', 'url', 'post', 'likes', 'isAdmin']
      // 去掉post.status不为1的list项
      list = list.filter((item) => {
        return item.post && item.post.status === 1
      })

      // 将list的email字段替换为gravatar头像
      list.forEach((item) => {
        const email = item.email
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

// 根据服务器提供的时区，查询每个月的status为1的post总数，返回的数据包含 2023年12月 和 count
exports.getPostArchiveList = async function (req, res, next) {
  console.info('postArchive get')
  const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
  const promise = new Promise((resolve, reject) => {
    postUtils.aggregate([
      {
        $match: {
          status: 1,
          // type 1 和 2
          type: { $in: [1, 2] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$date", timezone: siteTimeZone } },
            month: { $month: { date: "$date", timezone: siteTimeZone } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]).then((data) => {
      global.$cacheData.postArchiveList = data
      resolve(data)
      console.info('postArchive get success')
    }).catch((err) => {
      global.$cacheData.postArchiveList = null
      reject(err)
      console.error('postArchive get fail')
    })
  })
  return promise
}
// 获取bangumi的年份表
exports.getBangumiYearList = async function (req, res, next) {
  console.info('bangumiYearList get')
  const promise = new Promise((resolve, reject) => {
    bangumiUtils.aggregate([
      {
        $match: {
          status: 1,
        }
      },
      {
        $facet: {
          count: [
            {
              $count: "total"
            }
          ],
          data: [
            {
              $group: {
                _id: "$year",
                seasons: { $addToSet: "$season" }
              }
            },
            {
              $project: {
                _id: 0,
                year: "$_id",
                seasonList: "$seasons"
              }
            },
            {
              $sort: {
                'year': -1
              }
            }
          ]
        }
      }
    ]).then((data) => {
      let base = {
        total: 0,
        list: []
      }
      const data_ = data[0]
      if (data_) {
        if (data_.count.length > 0) {
          base.total = data_.count[0].total
        }
        if (data_.data.length > 0) {
          base.list = data_.data
        }
      }

      global.$cacheData.bangumiYearList = base
      resolve(data)
      console.info('bangumiYearList get success')
    }).catch((err) => {
      global.$cacheData.bangumiYearList = null
      reject(err)
      console.error('bangumiYearList get fail')
    })
  })
  return promise
}