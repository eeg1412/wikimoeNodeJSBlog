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
      // postlist
      {
        path: '/post/list',
        name: 'PostList',
        component: () => import(/* webpackChunkName: "PostList" */ '../views/index/post/PostList.vue')
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
