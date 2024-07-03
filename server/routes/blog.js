var express = require('express')
var router = express.Router()
const { } = require('../utils/utils')

const blogRouteSetting = [
  {
    path: '/options',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/option/getoptionList'),
  },
  // getnaviList
  {
    path: '/navi/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/navi/getnaviList'),
  },
  // getPostList
  {
    path: '/post/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/post/getPostList'),
  },
  // getBannerList
  {
    path: '/banner/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/banner/getBannerList'),
  },
  // getSidebar
  {
    path: '/sidebar/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/sidebar/getSidebarList'),
  },
  // getLatestComments
  {
    path: '/comment/latest',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/comment/getLatestComments'),
  },
  // getSortList
  {
    path: '/sort/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/sort/getSortList'),
  },
  // getPostArchiveList
  {
    path: '/post/archive',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/post/getPostArchiveList'),
  },
  // get getPostDetail
  {
    path: '/post/detail',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/post/getPostDetail'),
  },
  // get getCommentList
  {
    path: '/comment/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/comment/getCommentList'),
  },
  // post createComment
  {
    path: '/comment/create',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/comment/createComment'),
  },
  // put updatePostViewCount
  {
    path: '/post/view/count',
    method: 'put',
    middleware: [],
    controller: require('../api/blog/post/updatePostViewCount'),
  },
  // post createPostLikeLog
  {
    path: '/post/like/log',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/postLikeLog/createPostLikeLog'),
  },
  // post getPostLikeLogList
  {
    path: '/post/like/log/list',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/postLikeLog/getPostLikeLogList'),
  },
  // post createCommentLikeLog
  {
    path: '/comment/like/log',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/commentLikeLog/createCommentLikeLog'),
  },
  // post getPostCommentLogList
  {
    path: '/comment/like/log/list',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/commentLikeLog/getPostCommentLogList'),
  },
  // get getlinkList
  {
    path: '/link/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/link/getlinkList'),
  },
  // getBangumiList
  {
    path: '/bangumi/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/bangumi/getBangumiList'),
  },
  // getBangumiYearList
  {
    path: '/bangumi/year/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/bangumi/getBangumiYearList'),
  },
  // getSortDetail
  {
    path: '/sort/detail',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/sort/getSortDetail'),
  },
  // getTagDetail
  {
    path: '/tag/detail',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/tag/getTagDetail'),
  },
  // getGameList
  {
    path: '/game/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/game/getGameList'),
  },
  // getGamePlatformList
  {
    path: '/game/platform/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/game/getGamePlatformList'),
  },
  // getBookList
  {
    path: '/book/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/book/getBookList'),
  },
  // getBooktypeList
  {
    path: '/booktype/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/book/getBooktypeList'),
  },
  // getAttachmentList
  {
    path: '/attachment/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/attachment/getAttachmentList'),
  },
  // getEventList
  {
    path: '/event/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/event/getEventList'),
  },
  // getEventDetail
  {
    path: '/event/detail',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/event/getEventDetail'),
  },
  // createLog
  {
    path: '/log/create',
    method: 'post',
    middleware: [],
    controller: require('../api/blog/log/createLog'),
  },
  // updateLogPerformanceNavigationTiming
  {
    path: '/log/update/performance',
    method: 'put',
    middleware: [],
    controller: require('../api/blog/log/updateLogPerformanceNavigationTiming'),
  },
  // getTrendList
  {
    path: '/trend/list',
    method: 'get',
    middleware: [],
    controller: require('../api/blog/trend/getTrendList'),
  },
]

blogRouteSetting.forEach(item => {
  router[item.method](item.path, ...item.middleware, item.controller)
})

module.exports = router
