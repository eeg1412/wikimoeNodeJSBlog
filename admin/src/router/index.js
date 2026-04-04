import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    // 跳转到Home页面
    redirect: '/home',
    component: () => import('../views/index/Index.vue'),
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../views/index/home/Home.vue')
      },
      // LoginUserEditor
      {
        path: '/loginuser/editor',
        name: 'LoginUserEditor',
        component: () => import('../views/index/loginuser/LoginUserEditor.vue')
      },
      // SortList
      {
        path: '/sort/list',
        name: 'SortList',
        component: () => import('../views/index/sort/SortList.vue')
      },
      // SortEditor
      {
        path: '/sort/add',
        name: 'SortAdd',
        component: () => import('../views/index/sort/SortEditor.vue')
      },
      // SortEditor
      {
        path: '/sort/editor/:id',
        name: 'SortEdit',
        component: () => import('../views/index/sort/SortEditor.vue')
      },
      // TagList
      {
        path: '/tag/list',
        name: 'TagList',
        component: () => import('../views/index/tag/TagList.vue')
      },
      // TagEditor
      {
        path: '/tag/add',
        name: 'TagAdd',
        component: () => import('../views/index/tag/TagEditor.vue')
      },
      // TagEditor
      {
        path: '/tag/editor/:id',
        name: 'TagEdit',
        component: () => import('../views/index/tag/TagEditor.vue')
      },
      // MappointList
      {
        path: '/mappoint/list',
        name: 'MappointList',
        component: () => import('../views/index/mappoint/MappointList.vue')
      },
      // MappointEditor
      {
        path: '/mappoint/add',
        name: 'MappointAdd',
        component: () => import('../views/index/mappoint/MappointEditor.vue')
      },
      // MappointEditor
      {
        path: '/mappoint/editor/:id',
        name: 'MappointEdit',
        component: () => import('../views/index/mappoint/MappointEditor.vue')
      },
      // LinkList
      {
        path: '/link/list',
        name: 'LinkList',
        component: () => import('../views/index/link/LinkList.vue')
      },
      // LinkEditor
      {
        path: '/link/add',
        name: 'LinkAdd',
        component: () => import('../views/index/link/LinkEditor.vue')
      },
      // LinkEditor
      {
        path: '/link/editor/:id',
        name: 'LinkEdit',
        component: () => import('../views/index/link/LinkEditor.vue')
      },
      // NaviList
      {
        path: '/navi/list',
        name: 'NaviList',
        component: () => import('../views/index/navi/NaviList.vue')
      },
      // NaviEditor
      {
        path: '/navi/add',
        name: 'NaviAdd',
        component: () => import('../views/index/navi/NaviEditor.vue')
      },
      // NaviEditor
      {
        path: '/navi/editor/:id',
        name: 'NaviEdit',
        component: () => import('../views/index/navi/NaviEditor.vue')
      },
      // AlbumList
      {
        path: '/album/list',
        name: 'AlbumList',
        component: () => import('../views/index/album/AlbumList.vue')
      },
      // postlist
      {
        path: '/post/list',
        name: 'PostList',
        component: () => import('../views/index/post/PostList.vue')
      },
      // posteditor
      {
        path: '/post/editor/:id',
        name: 'PostEdit',
        component: () => import('../views/index/post/PostEditor.vue')
      },
      // CommentList
      {
        path: '/comment/list',
        name: 'CommentList',
        component: () => import('../views/index/comment/CommentList.vue')
      },
      // CommentEditor
      {
        path: '/comment/editor/:id',
        name: 'CommentEdit',
        component: () => import('../views/index/comment/CommentEditor.vue')
      },
      // BangumiList
      {
        path: '/bangumi/list',
        name: 'BangumiList',
        component: () => import('../views/index/bangumi/BangumiList.vue')
      },
      // BangumiEditor
      {
        path: '/bangumi/editor/:id',
        name: 'BangumiEdit',
        component: () => import('../views/index/bangumi/BangumiEditor.vue')
      },
      // BangumiEditor
      {
        path: '/bangumi/add',
        name: 'BangumiAdd',
        component: () => import('../views/index/bangumi/BangumiEditor.vue')
      },
      // MovieList
      {
        path: '/movie/list',
        name: 'MovieList',
        component: () => import('../views/index/movie/MovieList.vue')
      },
      // MovieEditor
      {
        path: '/movie/editor/:id',
        name: 'MovieEdit',
        component: () => import('../views/index/movie/MovieEditor.vue')
      },
      // MovieEditor
      {
        path: '/movie/add',
        name: 'MovieAdd',
        component: () => import('../views/index/movie/MovieEditor.vue')
      },
      // SidebarList
      {
        path: '/sidebar/list',
        name: 'SidebarList',
        component: () => import('../views/index/sidebar/SidebarList.vue')
      },
      // BannerList
      {
        path: '/banner/list',
        name: 'BannerList',
        component: () => import('../views/index/banner/BannerList.vue')
      },
      // ReaderlogList
      {
        path: '/readerlog/list',
        name: 'ReaderlogList',
        component: () => import('../views/index/readerlog/ReaderlogList.vue')
      },
      // UserLoginLogList
      {
        path: '/userloginlog/list',
        name: 'UserLoginLogList',
        component: () =>
          import('../views/index/userloginlog/UserLoginLogList.vue')
      },
      // PostLikeLogList
      {
        path: '/postlikelog/list',
        name: 'PostLikeLogList',
        component: () =>
          import('../views/index/postLikeLog/PostLikeLogList.vue')
      },
      // CommentLikeLogList
      {
        path: '/commentlikelog/list',
        name: 'CommentLikeLogList',
        component: () =>
          import('../views/index/commentLikeLog/CommentLikeLogList.vue')
      },
      // EmailSendHistoryList
      {
        path: '/emailsendhistory/list',
        name: 'EmailSendHistoryList',
        component: () =>
          import('../views/index/emailSendHistory/EmailSendHistoryList.vue')
      },
      // ReferrerList
      {
        path: '/referrer/list',
        name: 'ReferrerList',
        component: () => import('../views/index/referrer/ReferrerList.vue')
      },
      // RsslogList
      {
        path: '/rsslog/list',
        name: 'RsslogList',
        component: () => import('../views/index/rsslog/RsslogList.vue')
      },
      // GamePlatformList
      {
        path: '/gameplatform/list',
        name: 'GamePlatformList',
        component: () =>
          import('../views/index/gamePlatform/GamePlatformList.vue')
      },
      // GameList
      {
        path: '/game/list',
        name: 'GameList',
        component: () => import('../views/index/game/GameList.vue')
      },
      // GameEditor
      {
        path: '/game/editor/:id',
        name: 'GameEdit',
        component: () => import('../views/index/game/GameEditor.vue')
      },
      // GameEditor
      {
        path: '/game/add',
        name: 'GameAdd',
        component: () => import('../views/index/game/GameEditor.vue')
      },
      // BooktypeList
      {
        path: '/booktype/list',
        name: 'BooktypeList',
        component: () => import('../views/index/booktype/BooktypeList.vue')
      },
      // BookList
      {
        path: '/book/list',
        name: 'BookList',
        component: () => import('../views/index/book/BookList.vue')
      },
      // BookEditor
      {
        path: '/book/editor/:id',
        name: 'BookEdit',
        component: () => import('../views/index/book/BookEditor.vue')
      },
      // BookEditor
      {
        path: '/book/add',
        name: 'BookAdd',
        component: () => import('../views/index/book/BookEditor.vue')
      },
      // EventtypeList
      {
        path: '/eventtype/list',
        name: 'EventtypeList',
        component: () => import('../views/index/eventtype/EventtypeList.vue')
      },
      // EventList
      {
        path: '/event/list',
        name: 'EventList',
        component: () => import('../views/index/event/EventList.vue')
      },
      // EventEditor
      {
        path: '/event/editor/:id',
        name: 'EventEdit',
        component: () => import('../views/index/event/EventEditor.vue')
      },
      // EventEditor
      {
        path: '/event/add',
        name: 'EventAdd',
        component: () => import('../views/index/event/EventEditor.vue')
      },
      // BackupList
      {
        path: '/backup/list',
        name: 'BackupList',
        component: () => import('../views/index/backup/BackupList.vue')
      },
      // UserList
      {
        path: '/user/list',
        name: 'UserList',
        component: () => import('../views/index/user/UserList.vue')
      },
      // UserAdd
      {
        path: '/user/add',
        name: 'UserAdd',
        component: () => import('../views/index/user/UserAdd.vue')
      },
      // UserEditor
      {
        path: '/user/editor/:id',
        name: 'UserEdit',
        component: () => import('../views/index/user/UserEditor.vue')
      },
      // VoteList
      {
        path: '/vote/list',
        name: 'VoteList',
        component: () => import('../views/index/vote/VoteList.vue')
      },
      // VoteAdd
      {
        path: '/vote/add',
        name: 'VoteAdd',
        component: () => import('../views/index/vote/VoteEditor.vue')
      },
      // VoteEditor
      {
        path: '/vote/editor/:id',
        name: 'VoteEdit',
        component: () => import('../views/index/vote/VoteEditor.vue')
      },
      // VotelogList
      {
        path: '/votelog/list',
        name: 'VotelogList',
        component: () => import('../views/index/votelog/VotelogList.vue')
      },

      // config
      {
        path: '/config',
        name: 'Config',
        component: () => import('../views/index/config/Config.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/admin'),
  routes
})

export default router
