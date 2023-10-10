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
      // postlist
      {
        path: '/postlist',
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
