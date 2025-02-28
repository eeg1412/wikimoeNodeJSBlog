const naviUtils = require('../mongodb/utils/navis')
const sidebarUtils = require('../mongodb/utils/sidebars')
const bannerUtils = require('../mongodb/utils/banners')
const sortUtils = require('../mongodb/utils/sorts')
const postUtils = require('../mongodb/utils/posts')
const bangumiUtils = require('../mongodb/utils/bangumis')
const bookUtils = require('../mongodb/utils/books')
const gameUtils = require('../mongodb/utils/games')
const commentUtils = require('../mongodb/utils/comments')

const utils = require('../utils/utils')

exports.getNaviList = async function () {
  console.info('naviList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    naviUtils.find({ status: 1 }, sort, undefined, { lean: true }).then((data) => {
      // 根据返回的data，配合parent字段，生成树形结构
      const jsonData = data
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

exports.getSortList = async function () {
  console.info('sortList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    sortUtils.find({}, sort, undefined, { lean: true }).then((data) => {
      // 根据返回的data，配合parent字段，生成树形结构
      const jsonData = data
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

exports.getSidebarList = async function () {
  console.info('sidebarList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = await new Promise((resolve, reject) => {
    sidebarUtils.find({ status: 1 }, sort, undefined, { lean: true }).then((data) => {
      global.$cacheData.sidebarList = data
      resolve(data)
      // 更新 getCommentList
      this.getCommentList()
      // 更新 getBangumiSeasonList
      this.getBangumiSeasonList()
      // 更新 getPlayingGameList
      this.getPlayingGameList()
      // 更新 getReadingBookList
      this.getReadingBookList()
      // 重置
      exports.resetCacheDataByType(12, 'trendPostListData');
      exports.resetCacheDataByType(4, 'randomTagListData');
      console.info('sidebarList get success')
    }).catch((err) => {
      global.$cacheData.sidebarList = null
      reject(err)
      console.error('sidebarList get fail')
    })
  })
  return promise
}

exports.resetCacheDataByType = (sidebarType, cacheDataName) => {
  // 从全局缓存中获取侧边栏列表
  const sidebarList = global.$cacheData.sidebarList || [];
  // 查找指定类型的侧边栏
  const targetSidebar = sidebarList.find(item => item.type === sidebarType);

  // 如果不存在指定类型的侧边栏，或者其count属性小于等于0
  if (!targetSidebar || targetSidebar.count <= 0) {
    global.$cacheData[cacheDataName] = null;
    return true;
  }

  // 检查缓存中的数据是否需要更新
  const cacheLimit = global.$cacheData[cacheDataName]?.limit || 0;
  if (cacheLimit !== targetSidebar.count) {
    global.$cacheData[cacheDataName] = null;
    return true;
  }

  return false;
}


exports.getBannerList = async function () {
  console.info('bannerList get')
  const sort = {
    taxis: 1,
    _id: -1
  }
  const promise = new Promise((resolve, reject) => {
    bannerUtils.find({ status: 1 }, sort, undefined, { lean: true }).then((data) => {
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
exports.getCommentList = async function () {
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
    commentUtils.findPage({ status: 1 }, sort, 1, count, undefined, { postFilter: 'status _id alias type', lean: true }).then((data) => {
      let list = data.list
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
exports.getPostArchiveList = async function () {
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
exports.getBangumiYearList = async function () {
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
          // count: [
          //   {
          //     $count: "total"
          //   }
          // ],
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
        // total: 0,
        list: []
      }
      const data_ = data[0]
      if (data_) {
        // if (data_.count.length > 0) {
        //   base.total = data_.count[0].total
        // }
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

// 获取当季追番
exports.getBangumiSeasonList = async function () {
  console.info('bangumiSeasonList get')
  // 查询global.$cacheData.sidebarList里type为13的侧边栏
  const sidebarList = global.$cacheData.sidebarList || []
  const bangumiSeasonSidebar = sidebarList.find((item) => {
    return item.type === 13
  })
  // 不存在type为13的侧边栏
  if (!bangumiSeasonSidebar) {
    global.$cacheData.bangumiSeasonObj = null
    // reject
    return []
  }
  // 存在type为13的侧边栏,获取count
  const count = bangumiSeasonSidebar.count || 0
  // 如果count小于等于0，不获取当季追番
  if (count <= 0) {
    global.$cacheData.bangumiSeasonObj = null
    // reject
    return []
  }
  const sort = {
    rating: -1,
    _id: -1
  }
  const yearSeason = utils.getYearSeason()
  const promise = new Promise((resolve, reject) => {
    bangumiUtils.findPage({ status: 1, year: yearSeason.year, season: yearSeason.season }, sort, 1, count, '_id cover label rating season status summary title year giveUp urlList', { lean: true }).then((data) => {
      global.$cacheData.bangumiSeasonObj = {
        year: yearSeason.year,
        season: yearSeason.season,
        list: data.list
      }
      resolve(global.$cacheData.bangumiSeasonObj)
      console.info('bangumiSeasonList get success')
    }).catch((err) => {
      global.$cacheData.bangumiSeasonObj = null
      reject(err)
      console.error('bangumiSeasonList get fail')
    })
  })
  return promise
}
// 检查当季追番是否需要更新
exports.checkBangumiSeasonList = async function () {
  const yearSeason = utils.getYearSeason()
  if (global.$cacheData.bangumiSeasonObj && global.$cacheData.bangumiSeasonObj?.year === yearSeason.year && global.$cacheData.bangumiSeasonObj?.season === yearSeason.season) {
    return global.$cacheData.bangumiSeasonObj
  }
  console.info('bangumiSeason should update')
  await this.getBangumiSeasonList()
  return global.$cacheData.bangumiSeasonObj
}

// 获取攻略中的游戏
exports.getPlayingGameList = async function () {
  console.info('playingGameList get')
  const sidebarList = global.$cacheData.sidebarList || []
  const playingGameSidebar = sidebarList.find((item) => {
    return item.type === 14
  })
  if (!playingGameSidebar) {
    global.$cacheData.playingGameList = null
    return []
  }
  const count = playingGameSidebar.count || 0
  if (count <= 0) {
    global.$cacheData.playingGameList = null
    return []
  }
  const sort = {
    rating: -1,
    _id: -1
  }
  const params = {
    status: 1,
    giveUp: { $ne: true },
    startTime: { $ne: null },
    endTime: { $eq: null }
  }
  const promise = new Promise((resolve, reject) => {
    gameUtils.findPage(params, sort, 1, count, '_id cover endTime gamePlatform label rating screenshotAlbum startTime status summary title urlList giveUp', { lean: true }).then((data) => {
      global.$cacheData.playingGameList = data.list
      resolve(data.list)
      console.info('playingGameList get success')
    }).catch((err) => {
      global.$cacheData.playingGameList = null
      reject(err)
      console.error('playingGameList get fail')
    })
  })
  return promise
}

// 获取阅读中的书籍
exports.getReadingBookList = async function () {
  console.info('readingBookList get')
  const sidebarList = global.$cacheData.sidebarList || []
  const readingBookSidebar = sidebarList.find((item) => {
    return item.type === 15
  })
  if (!readingBookSidebar) {
    global.$cacheData.readingBookList = null
    return []
  }
  const count = readingBookSidebar.count || 0
  if (count <= 0) {
    global.$cacheData.readingBookList = null
    return []
  }
  const sort = {
    rating: -1,
    _id: -1
  }
  const params = {
    status: 1,
    giveUp: { $ne: true },
    startTime: { $ne: null },
    endTime: { $eq: null }
  }
  const promise = new Promise((resolve, reject) => {
    bookUtils.findPage(params, sort, 1, count, '_id cover endTime booktype label rating startTime status summary title urlList giveUp', { lean: true }).then((data) => {
      global.$cacheData.readingBookList = data.list
      resolve(data.list)
      console.info('readingBookList get success')
    }).catch((err) => {
      global.$cacheData.readingBookList = null
      reject(err)
      console.error('readingBookList get fail')
    })
  })
  return promise
}
