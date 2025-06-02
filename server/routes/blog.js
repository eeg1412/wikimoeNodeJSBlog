var express = require('express')
var router = express.Router()
const { checkJWTBlog, referrerRecord } = require('../utils/utils')

const checkIsReady = (req, res, next) => {
  const isReady = global.$isReady
  if (isReady) {
    next()
  } else {
    res.status(503).send('Service Unavailable')
  }
}

const checkWmbRequestId = (req, res, next) => {
  // 用于兼容旧版本的wmb-request-id
  const headerId = req.headers['wmb-request-id']
  const cookieId = req.cookies['wmbuuid']
  if (!headerId && cookieId) {
    req.headers['wmb-request-id'] = cookieId
  }
  next()
}

const commonHandle = (req, res, next) => {
  // 检查wmb-request-id
  checkWmbRequestId(req, res, next)
}

const referrerRecordMiddleware = (req, res, next) => {
  referrerRecord(req.headers.referer, 'blogApi')
  next()
}

// jwt权限校验
const checkAuth = (req, res, next, typeName, token) => {
  const jwtVersion = 1
  if (!token) {
    next()
  } else {
    const decoded = checkJWTBlog(token.split(' ')[1] || '')
    // console.log(decoded)
    if (!decoded.isError) {
      if (decoded.data.version === jwtVersion) {
        req[`${typeName}Decode`] = decoded.data
      }
    }
    next()
  }
}

const checkCommentRetractAuth = (req, res, next) => {
  const token = req.headers['wm-comment-retract-authorization']
  checkAuth(req, res, next, 'commentRetractAuth', token)
}

const blogRouteSetting = [
  {
    path: '/options',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/option/getoptionList'),
  },
  // getnaviList
  {
    path: '/navi/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/navi/getnaviList'),
  },
  // getPostList
  {
    path: '/post/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/post/getPostList'),
  },
  // getBannerList
  {
    path: '/banner/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/banner/getBannerList'),
  },
  // getSidebar
  {
    path: '/sidebar/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/sidebar/getSidebarList'),
  },
  // getLatestComments
  {
    path: '/comment/latest',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/comment/getLatestComments'),
  },
  // getSortList
  {
    path: '/sort/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/sort/getSortList'),
  },
  // getPostArchiveList
  {
    path: '/post/archive',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/post/getPostArchiveList'),
  },
  // get getPostDetail
  {
    path: '/post/detail',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/post/getPostDetail'),
  },
  // get getCommentList
  {
    path: '/comment/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/comment/getCommentList'),
  },
  // post createComment
  {
    path: '/comment/create',
    method: 'post',
    middleware: [commonHandle, checkCommentRetractAuth],
    controller: require('../api/blog/comment/createComment'),
  },
  // post commentRetract
  {
    path: '/comment/retract',
    method: 'post',
    middleware: [commonHandle, checkCommentRetractAuth],
    controller: require('../api/blog/comment/commentRetract'),
  },
  // put updatePostViewCount
  {
    path: '/post/view/count',
    method: 'put',
    middleware: [commonHandle],
    controller: require('../api/blog/post/updatePostViewCount'),
  },
  // post createPostLikeLog
  {
    path: '/post/like/log',
    method: 'post',
    middleware: [commonHandle],
    controller: require('../api/blog/postLikeLog/createPostLikeLog'),
  },
  // post getPostLikeLogList
  // {
  //   path: '/post/like/log/list',
  //   method: 'post',
  //   middleware: [commonHandle],
  //   controller: require('../api/blog/postLikeLog/getPostLikeLogList'),
  // },
  // post createCommentLikeLog
  {
    path: '/comment/like/log',
    method: 'post',
    middleware: [commonHandle],
    controller: require('../api/blog/commentLikeLog/createCommentLikeLog'),
  },
  // post getPostCommentLogList
  {
    path: '/comment/like/log/list',
    method: 'post',
    middleware: [commonHandle],
    controller: require('../api/blog/commentLikeLog/getPostCommentLogList'),
  },
  // get getlinkList
  {
    path: '/link/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/link/getlinkList'),
  },
  // getBangumiList
  {
    path: '/bangumi/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/bangumi/getBangumiList'),
  },
  // getBangumiSeasonList
  {
    path: '/bangumi/season/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/bangumi/getBangumiSeasonList'),
  },
  // getBangumiYearList
  {
    path: '/bangumi/year/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/bangumi/getBangumiYearList'),
  },
  // getMovieList
  {
    path: '/movie/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/movie/getMovieList'),
  },
  // getMovieYearList
  {
    path: '/movie/year/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/movie/getMovieYearList'),
  },
  // getSortDetail
  {
    path: '/sort/detail',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/sort/getSortDetail'),
  },
  // getTagDetail
  {
    path: '/tag/detail',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/tag/getTagDetail'),
  },
  // getRandomTagList
  {
    path: '/tag/random/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/tag/getRandomTagList'),
  },
  // getGameList
  {
    path: '/game/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/game/getGameList'),
  },
  // getPlayingGameList
  {
    path: '/game/playing/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/game/getPlayingGameList'),
  },
  // getGamePlatformList
  {
    path: '/game/platform/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/game/getGamePlatformList'),
  },
  // getBookList
  {
    path: '/book/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/book/getBookList'),
  },
  // getReadingBookList
  {
    path: '/book/reading/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/book/getReadingBookList'),
  },
  // getBooktypeList
  {
    path: '/booktype/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/book/getBooktypeList'),
  },
  // getAttachmentList
  {
    path: '/attachment/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/attachment/getAttachmentList'),
  },
  // getEventList
  {
    path: '/event/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/event/getEventList'),
  },
  // getEventDetail
  {
    path: '/event/detail',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/event/getEventDetail'),
  },
  // createLog
  {
    path: '/log/create',
    method: 'post',
    middleware: [commonHandle],
    controller: require('../api/blog/log/createLog'),
  },
  // updateLogPerformanceNavigationTiming
  {
    path: '/log/update/performance',
    method: 'put',
    middleware: [commonHandle],
    controller: require('../api/blog/log/updateLogPerformanceNavigationTiming'),
  },
  // getTrendPostList
  {
    path: '/trend/post/list',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/trend/getTrendPostList'),
  },
  // getVoteDetail
  {
    path: '/vote/detail',
    method: 'get',
    middleware: [commonHandle],
    controller: require('../api/blog/vote/getVoteDetail'),
  },
  // postVote
  {
    path: '/vote',
    method: 'post',
    middleware: [commonHandle],
    controller: require('../api/blog/vote/postVote'),
  },
]

blogRouteSetting.forEach(item => {
  const middleware = [checkIsReady, referrerRecordMiddleware, ...item.middleware]
  router[item.method](item.path, ...middleware, item.controller)
})

module.exports = router
