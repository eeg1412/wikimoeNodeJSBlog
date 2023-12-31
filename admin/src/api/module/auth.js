export default function (api) {
  return {
    login (data) {
      return api.post('/login', data)
    },
    // get,loginuserinfo
    loginuserinfo () {
      return api.get('/loginuserinfo', {
        shouldAdminJWT: true
      })
    },
    // put,loginuserinfo
    updateLoginUserInfo (data) {
      return api.put('/loginuserinfo', data, {
        shouldAdminJWT: true
      })
    },
    // post sort/create
    createSort (data) {
      return api.post('/sort/create', data, {
        shouldAdminJWT: true
      })
    },
    // get sort/list
    getSortList () {
      return api.get('/sort/list', {
        shouldAdminJWT: true
      })
    },
    // get sort/detail
    getSortDetail (data) {
      return api.get('/sort/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put sort/update
    updateSort (data) {
      return api.put('/sort/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete sort/delete
    deleteSort (data) {
      return api.delete('/sort/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get tag/list
    getTagList (data, noLoading = false) {
      return api.get('/tag/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get tag/detail
    getTagDetail (data) {
      return api.get('/tag/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post tag/create
    createTag (data) {
      return api.post('/tag/create', data, {
        shouldAdminJWT: true
      })
    },
    // put tag/update
    updateTag (data) {
      return api.put('/tag/update', data, {
        shouldAdminJWT: true
      })
    },
    // put /tag/update/lastusetime
    updateTagLastUseTime (data) {
      return api.put('/tag/update/lastusetime', data, {
        shouldAdminJWT: true,
        noLoading: true
      })
    },
    // delete tag/delete
    deleteTag (data) {
      return api.delete('/tag/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get album/list
    getAlbumList (data) {
      return api.get('/album/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get album/detail
    getAlbumDetail (data) {
      return api.get('/album/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post album/create
    createAlbum (data) {
      return api.post('/album/create', data, {
        shouldAdminJWT: true
      })
    },
    // put album/update
    updateAlbum (data) {
      return api.put('/album/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete album/delete
    deleteAlbum (data) {
      return api.delete('/album/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /config
    getConfig () {
      return api.get('/config', {
        shouldAdminJWT: true
      })
    },
    // put /config/media
    updateConfigMedia (data) {
      return api.put('/config/media', data, {
        shouldAdminJWT: true
      })
    },
    // get /attachment/list
    getAttachmentList (data) {
      return api.get('/attachment/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // delete /attachment/delete
    deleteAttachment (data) {
      return api.delete('/attachment/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /attachment/update/name
    updateAttachmentInfo (data) {
      return api.put('/attachment/update/info', data, {
        shouldAdminJWT: true
      })
    },
    // put /attachment/update/album
    updateAttachmentAlbum (data) {
      return api.put('/attachment/update/album', data, {
        shouldAdminJWT: true
      })
    },
    // post /post/create
    createPost (data) {
      return api.post('/post/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /post/list
    getPostList (data) {
      return api.get('/post/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /post/detail
    getPostDetail (data) {
      return api.get('/post/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /post/update
    updatePost (data, noLoading = false) {
      return api.put('/post/update', data, {
        shouldAdminJWT: true,
        noLoading
      })
    },
    // delete /post/delete
    deletePost (data) {
      return api.delete('/post/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /comment/create
    createComment (data) {
      return api.post('/comment/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /comment/list
    getCommentList (data) {
      return api.get('/comment/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /comment/detail
    getCommentDetail (data) {
      return api.get('/comment/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /comment/update
    updateComment (data) {
      return api.put('/comment/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /comment/delete
    deleteComment (data) {
      return api.delete('/comment/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /link/list
    getLinkList (data) {
      return api.get('/link/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /link/detail
    getLinkDetail (data) {
      return api.get('/link/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /link/create
    createLink (data) {
      return api.post('/link/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /link/update
    updateLink (data) {
      return api.put('/link/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /link/delete
    deleteLink (data) {
      return api.delete('/link/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /navi/list
    getNaviList (data) {
      return api.get('/navi/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /navi/detail
    getNaviDetail (data) {
      return api.get('/navi/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /navi/create
    createNavi (data) {
      return api.post('/navi/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /navi/update
    updateNavi (data) {
      return api.put('/navi/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /navi/delete
    deleteNavi (data) {
      return api.delete('/navi/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /option/update
    updateOption (data) {
      return api.put('/option/update', data, {
        shouldAdminJWT: true
      })
    },
    // get /option/list
    getOptionList (data) {
      return api.get('/option/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get dashboard
    getDashboard () {
      return api.get('/dashboard', {
        shouldAdminJWT: true
      })
    },
    // get /sidebar/list
    getSidebarList (data) {
      return api.get('/sidebar/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /sidebar/create
    createSidebar (data) {
      return api.post('/sidebar/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /sidebar/update
    updateSidebar (data) {
      return api.put('/sidebar/update', data, {
        shouldAdminJWT: true
      })
    },
    // put /sidebar/update/taxis
    updateSidebarTaxis (data) {
      return api.put('/sidebar/update/taxis', data, {
        shouldAdminJWT: true
      })
    },
    // delete /sidebar/delete
    deleteSidebar (data) {
      return api.delete('/sidebar/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /banner/list
    getBannerList (data) {
      return api.get('/banner/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /banner/create
    createBanner (data) {
      return api.post('/banner/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /banner/update
    updateBanner (data) {
      return api.put('/banner/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /banner/delete
    deleteBanner (data) {
      return api.delete('/banner/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /banner/update/img
    // updateBannerImg (data) {
    //   return api.put('/banner/update/img', data, {
    //     shouldAdminJWT: true
    //   })
    // },
    // put /banner/update/taxis
    updateBannerTaxis (data) {
      return api.put('/banner/update/taxis', data, {
        shouldAdminJWT: true
      })
    },
    // get /readerlog/list
    getReaderlogList (data) {
      return api.get('/readerlog/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get '/postlikelog/list'
    getPostLikeLogList (data) {
      return api.get('/postlikelog/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get '/commentlikelog/list'
    getCommentLikeLogList (data) {
      return api.get('/commentlikelog/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // /bangumi/create
    createBangumi (data) {
      return api.post('/bangumi/create', data, {
        shouldAdminJWT: true
      })
    },
    // delete /bangumi/delete
    deleteBangumi (data) {
      return api.delete('/bangumi/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /bangumi/list
    getBangumiList (data) {
      return api.get('/bangumi/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /bangumi/detail
    getBangumiDetail (data) {
      return api.get('/bangumi/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /bangumi/update
    updateBangumi (data) {
      return api.put('/bangumi/update', data, {
        shouldAdminJWT: true
      })
    },
    // get /emailsendhistory/list
    getEmailSendHistoryList (data) {
      return api.get('/emailsendhistory/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get '/referrer/list'
    getReferrerList (data) {
      return api.get('/referrer/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
  }
}
