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
]

blogRouteSetting.forEach(item => {
  router[item.method](item.path, ...item.middleware, item.controller)
})

module.exports = router
