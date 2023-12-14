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

]

blogRouteSetting.forEach(item => {
  router[item.method](item.path, ...item.middleware, item.controller)
})

module.exports = router
