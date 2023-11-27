import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    // 跳转到Home页面
    redirect: '/home',
    component: () => import(/* webpackChunkName: "Index" */ '../views/index/Index.vue'),
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import(/* webpackChunkName: "Home" */ '../views/index/home/Home.vue')
      },
      // LoginUserEditor
      {
        path: '/loginuser/editor',
        name: 'LoginUserEditor',
        component: () => import(/* webpackChunkName: "LoginUserEditor" */ '../views/index/loginuser/LoginUserEditor.vue')
      },
      // SortList
      {
        path: '/sort/list',
        name: 'SortList',
        component: () => import(/* webpackChunkName: "SortList" */ '../views/index/sort/SortList.vue')
      },
      // SortEditor
      {
        path: '/sort/add',
        name: 'SortAdd',
        component: () => import(/* webpackChunkName: "SortEditor" */ '../views/index/sort/SortEditor.vue')
      },
      // SortEditor
      {
        path: '/sort/editor/:id',
        name: 'SortEdit',
        component: () => import(/* webpackChunkName: "SortEditor" */ '../views/index/sort/SortEditor.vue')
      },
      // TagList
      {
        path: '/tag/list',
        name: 'TagList',
        component: () => import(/* webpackChunkName: "TagList" */ '../views/index/tag/TagList.vue')
      },
      // TagEditor
      {
        path: '/tag/add',
        name: 'TagAdd',
        component: () => import(/* webpackChunkName: "TagEditor" */ '../views/index/tag/TagEditor.vue')
      },
      // TagEditor
      {
        path: '/tag/editor/:id',
        name: 'TagEdit',
        component: () => import(/* webpackChunkName: "TagEditor" */ '../views/index/tag/TagEditor.vue')
      },
      // LinkList
      {
        path: '/link/list',
        name: 'LinkList',
        component: () => import(/* webpackChunkName: "LinkList" */ '../views/index/link/LinkList.vue')
      },
      // LinkEditor
      {
        path: '/link/add',
        name: 'LinkAdd',
        component: () => import(/* webpackChunkName: "LinkEditor" */ '../views/index/link/LinkEditor.vue')
      },
      // LinkEditor
      {
        path: '/link/editor/:id',
        name: 'LinkEdit',
        component: () => import(/* webpackChunkName: "LinkEditor" */ '../views/index/link/LinkEditor.vue')
      },
      // AlbumList
      {
        path: '/album/list',
        name: 'AlbumList',
        component: () => import(/* webpackChunkName: "AlbumList" */ '../views/index/album/AlbumList.vue')
      },
      // postlist
      {
        path: '/post/list',
        name: 'PostList',
        component: () => import(/* webpackChunkName: "PostList" */ '../views/index/post/PostList.vue')
      },
      // posteditor
      {
        path: '/post/editor/:id',
        name: 'PostEdit',
        component: () => import(/* webpackChunkName: "PostEditor" */ '../views/index/post/PostEditor.vue')
      },
      // CommentList
      {
        path: '/comment/list',
        name: 'CommentList',
        component: () => import(/* webpackChunkName: "CommentList" */ '../views/index/comment/CommentList.vue')
      },
      // CommentEditor
      {
        path: '/comment/editor/:id',
        name: 'CommentEdit',
        component: () => import(/* webpackChunkName: "CommentEditor" */ '../views/index/comment/CommentEditor.vue')
      },
      // config
      {
        path: '/config',
        name: 'Config',
        component: () => import(/* webpackChunkName: "Config" */ '../views/index/config/Config.vue')
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "Login" */ '../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/admin'),
  routes
})

export default router
