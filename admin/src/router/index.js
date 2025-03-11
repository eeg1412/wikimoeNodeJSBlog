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
      // NaviList
      {
        path: '/navi/list',
        name: 'NaviList',
        component: () => import(/* webpackChunkName: "NaviList" */ '../views/index/navi/NaviList.vue')
      },
      // NaviEditor
      {
        path: '/navi/add',
        name: 'NaviAdd',
        component: () => import(/* webpackChunkName: "NaviEditor" */ '../views/index/navi/NaviEditor.vue')
      },
      // NaviEditor
      {
        path: '/navi/editor/:id',
        name: 'NaviEdit',
        component: () => import(/* webpackChunkName: "NaviEditor" */ '../views/index/navi/NaviEditor.vue')
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
      // BangumiList
      {
        path: '/bangumi/list',
        name: 'BangumiList',
        component: () => import(/* webpackChunkName: "BangumiList" */ '../views/index/bangumi/BangumiList.vue')
      },
      // BangumiEditor
      {
        path: '/bangumi/editor/:id',
        name: 'BangumiEdit',
        component: () => import(/* webpackChunkName: "BangumiEditor" */ '../views/index/bangumi/BangumiEditor.vue')
      },
      // BangumiEditor
      {
        path: '/bangumi/add',
        name: 'BangumiAdd',
        component: () => import(/* webpackChunkName: "BangumiEditor" */ '../views/index/bangumi/BangumiEditor.vue')
      },
      // MovieList
      {
        path: '/movie/list',
        name: 'MovieList',
        component: () => import(/* webpackChunkName: "MovieList" */ '../views/index/movie/MovieList.vue')
      },
      // MovieEditor
      {
        path: '/movie/editor/:id',
        name: 'MovieEdit',
        component: () => import(/* webpackChunkName: "MovieEditor" */ '../views/index/movie/MovieEditor.vue')
      },
      // MovieEditor
      {
        path: '/movie/add',
        name: 'MovieAdd',
        component: () => import(/* webpackChunkName: "MovieEditor" */ '../views/index/movie/MovieEditor.vue')
      },
      // SidebarList
      {
        path: '/sidebar/list',
        name: 'SidebarList',
        component: () => import(/* webpackChunkName: "SidebarList" */ '../views/index/sidebar/SidebarList.vue')
      },
      // BannerList
      {
        path: '/banner/list',
        name: 'BannerList',
        component: () => import(/* webpackChunkName: "BannerList" */ '../views/index/banner/BannerList.vue')
      },
      // ReaderlogList
      {
        path: '/readerlog/list',
        name: 'ReaderlogList',
        component: () => import(/* webpackChunkName: "ReaderlogList" */ '../views/index/readerlog/ReaderlogList.vue')
      },
      // PostLikeLogList
      {
        path: '/postlikelog/list',
        name: 'PostLikeLogList',
        component: () => import(/* webpackChunkName: "PostLikeLogList" */ '../views/index/postLikeLog/PostLikeLogList.vue')
      },
      // CommentLikeLogList
      {
        path: '/commentlikelog/list',
        name: 'CommentLikeLogList',
        component: () => import(/* webpackChunkName: "CommentLikeLogList" */ '../views/index/commentLikeLog/CommentLikeLogList.vue')
      },
      // EmailSendHistoryList
      {
        path: '/emailsendhistory/list',
        name: 'EmailSendHistoryList',
        component: () => import(/* webpackChunkName: "EmailSendHistoryList" */ '../views/index/emailSendHistory/EmailSendHistoryList.vue')
      },
      // ReferrerList
      {
        path: '/referrer/list',
        name: 'ReferrerList',
        component: () => import(/* webpackChunkName: "ReferrerList" */ '../views/index/referrer/ReferrerList.vue')
      },
      // RsslogList
      {
        path: '/rsslog/list',
        name: 'RsslogList',
        component: () => import(/* webpackChunkName: "RsslogList" */ '../views/index/rsslog/RsslogList.vue')
      },
      // GamePlatformList
      {
        path: '/gameplatform/list',
        name: 'GamePlatformList',
        component: () => import(/* webpackChunkName: "GamePlatformList" */ '../views/index/gamePlatform/GamePlatformList.vue')
      },
      // GameList
      {
        path: '/game/list',
        name: 'GameList',
        component: () => import(/* webpackChunkName: "GameList" */ '../views/index/game/GameList.vue')
      },
      // GameEditor
      {
        path: '/game/editor/:id',
        name: 'GameEdit',
        component: () => import(/* webpackChunkName: "GameEditor" */ '../views/index/game/GameEditor.vue')
      },
      // GameEditor
      {
        path: '/game/add',
        name: 'GameAdd',
        component: () => import(/* webpackChunkName: "GameEditor" */ '../views/index/game/GameEditor.vue')
      },
      // BooktypeList
      {
        path: '/booktype/list',
        name: 'BooktypeList',
        component: () => import(/* webpackChunkName: "BooktypeList" */ '../views/index/booktype/BooktypeList.vue')
      },
      // BookList
      {
        path: '/book/list',
        name: 'BookList',
        component: () => import(/* webpackChunkName: "BookList" */ '../views/index/book/BookList.vue')
      },
      // BookEditor
      {
        path: '/book/editor/:id',
        name: 'BookEdit',
        component: () => import(/* webpackChunkName: "BookEditor" */ '../views/index/book/BookEditor.vue')
      },
      // BookEditor
      {
        path: '/book/add',
        name: 'BookAdd',
        component: () => import(/* webpackChunkName: "BookEditor" */ '../views/index/book/BookEditor.vue')
      },
      // EventtypeList
      {
        path: '/eventtype/list',
        name: 'EventtypeList',
        component: () => import(/* webpackChunkName: "EventtypeList" */ '../views/index/eventtype/EventtypeList.vue')
      },
      // EventList
      {
        path: '/event/list',
        name: 'EventList',
        component: () => import(/* webpackChunkName: "EventList" */ '../views/index/event/EventList.vue')
      },
      // EventEditor
      {
        path: '/event/editor/:id',
        name: 'EventEdit',
        component: () => import(/* webpackChunkName: "EventEditor" */ '../views/index/event/EventEditor.vue')
      },
      // EventEditor
      {
        path: '/event/add',
        name: 'EventAdd',
        component: () => import(/* webpackChunkName: "EventEditor" */ '../views/index/event/EventEditor.vue')
      },
      // BackupList
      {
        path: '/backup/list',
        name: 'BackupList',
        component: () => import(/* webpackChunkName: "BackupList" */ '../views/index/backup/BackupList.vue')
      },
      // UserList
      {
        path: '/user/list',
        name: 'UserList',
        component: () => import(/* webpackChunkName: "UserList" */ '../views/index/user/UserList.vue')
      },
      // UserAdd
      {
        path: '/user/add',
        name: 'UserAdd',
        component: () => import(/* webpackChunkName: "UserAdd" */ '../views/index/user/UserAdd.vue')
      },
      // UserEditor
      {
        path: '/user/editor/:id',
        name: 'UserEdit',
        component: () => import(/* webpackChunkName: "UserEditor" */ '../views/index/user/UserEditor.vue')
      },
      // VoteList
      {
        path: '/vote/list',
        name: 'VoteList',
        component: () => import(/* webpackChunkName: "VoteList" */ '../views/index/vote/VoteList.vue')
      },
      // VoteAdd
      {
        path: '/vote/add',
        name: 'VoteAdd',
        component: () => import(/* webpackChunkName: "VoteAdd" */ '../views/index/vote/VoteEditor.vue')
      },
      // VoteEditor
      {
        path: '/vote/editor/:id',
        name: 'VoteEdit',
        component: () => import(/* webpackChunkName: "VoteEditor" */ '../views/index/vote/VoteEditor.vue')
      },
      // VotelogList
      {
        path: '/votelog/list',
        name: 'VotelogList',
        component: () => import(/* webpackChunkName: "VotelogList" */ '../views/index/votelog/VotelogList.vue')
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
