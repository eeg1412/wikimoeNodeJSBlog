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
    getSortList (data) {
      return api.get('/sort/list', {
        params: data,
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
    getAlbumList (data, options = {}) {
      return api.get('/album/list', {
        params: data,
        shouldAdminJWT: true,
        ...options
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
    // post /attachment/upload/video
    uploadAttachmentVideo (data) {
      return api.post('/attachment/upload/video', data, {
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
    getPostList (data, noLoading = false) {
      return api.get('/post/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
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
    // put /post/batch
    putBatchPost (data) {
      return api.put('/post/batch', data, {
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
    // put /comment/apply
    applyComment (data) {
      return api.put('/comment/apply', data, {
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
    // put /option/flushjwtsecretadmin
    flushJWTSecretAdmin () {
      return api.put('/option/flushjwtsecretadmin', {}, {
        shouldAdminJWT: true
      })
    },
    // put /option/flushjwtsecretblog
    flushJWTSecretBlog () {
      return api.put('/option/flushjwtsecretblog', {}, {
        shouldAdminJWT: true
      })
    },
    // get dashboard
    getDashboard () {
      return api.get('/dashboard', {
        shouldAdminJWT: true
      })
    },
    // get /dashboard/visitor
    getDashboardVisitor (data) {
      return api.get('/dashboard/visitor', {
        params: data,
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
    // put '/post/update/editorversion'
    updatePostEditorVersion (data) {
      return api.put('/post/update/editorversion', data, {
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
    // get /readerlog/stats
    getReaderlogStats () {
      return api.get('/readerlog/stats', {
        shouldAdminJWT: true
      })
    },
    // delete /readerlog/delete
    deleteReaderlog (data) {
      return api.delete('/readerlog/delete', {
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
    // get '/postlikelog/stats'
    getPostLikeLogStats () {
      return api.get('/postlikelog/stats', {
        shouldAdminJWT: true
      })
    },
    // delete /postlikelog/delete
    deletePostLikeLog (data) {
      return api.delete('/postlikelog/delete', {
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
    // get /commentlikelog/stats
    getCommentLikeLogStats () {
      return api.get('/commentlikelog/stats', {
        shouldAdminJWT: true
      })
    },
    // delete /commentlikelog/delete
    deleteCommentLikeLog (data) {
      return api.delete('/commentlikelog/delete', {
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
    getBangumiList (data, noLoading = false) {
      return api.get('/bangumi/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
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
    // post /movie/create
    createMovie (data) {
      return api.post('/movie/create', data, {
        shouldAdminJWT: true
      })
    },
    // delete /movie/delete
    deleteMovie (data) {
      return api.delete('/movie/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /movie/list
    getMovieList (data, noLoading = false) {
      return api.get('/movie/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /movie/detail
    getMovieDetail (data) {
      return api.get('/movie/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /movie/update
    updateMovie (data) {
      return api.put('/movie/update', data, {
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
    // post /emailsendhistory/resend
    resendEmailSendHistory (data) {
      return api.post('/emailsendhistory/resend', data, {
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
    // get /rsslog/list
    getRsslogList (data) {
      return api.get('/rsslog/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /statistics
    getStatistics (data) {
      return api.get('/statistics', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /statistics/loadingtime
    getLoadingTime (data) {
      return api.get('/statistics/loadingtime', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /gameplatform/create
    createGamePlatform (data) {
      return api.post('/gameplatform/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /gameplatform/list
    getGamePlatformList (data, options = {}) {
      return api.get('/gameplatform/list', {
        params: data,
        shouldAdminJWT: true,
        ...options
      })
    },
    // put /gameplatform/update
    updateGamePlatform (data) {
      return api.put('/gameplatform/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /gameplatform/delete
    deleteGamePlatform (data) {
      return api.delete('/gameplatform/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /gameplatform/detail
    getGamePlatformDetail (data) {
      return api.get('/gameplatform/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /game/create
    createGame (data) {
      return api.post('/game/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /game/list
    getGameList (data, noLoading = false) {
      return api.get('/game/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /game/detail
    getGameDetail (data) {
      return api.get('/game/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /game/update
    updateGame (data) {
      return api.put('/game/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /game/delete
    deleteGame (data) {
      return api.delete('/game/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /eventtype/list
    getEventtypeList (data, noLoading = false) {
      return api.get('/eventtype/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /eventtype/detail
    getEventtypeDetail (data) {
      return api.get('/eventtype/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /eventtype/create
    createEventtype (data) {
      return api.post('/eventtype/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /eventtype/update
    updateEventtype (data) {
      return api.put('/eventtype/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /eventtype/delete
    deleteEventtype (data) {
      return api.delete('/eventtype/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /event/list
    getEventList (data, noLoading = false) {
      return api.get('/event/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // post /event/create
    createEvent (data) {
      return api.post('/event/create', data, {
        shouldAdminJWT: true
      })
    },
    // put /event/update
    updateEvent (data) {
      return api.put('/event/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /event/delete
    deleteEvent (data) {
      return api.delete('/event/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /event/detail
    getEventDetail (data) {
      return api.get('/event/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /booktype/create
    createBooktype (data) {
      return api.post('/booktype/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /booktype/list
    getBooktypeList (data, noLoading = false) {
      return api.get('/booktype/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /booktype/detail
    getBooktypeDetail (data) {
      return api.get('/booktype/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /booktype/update
    updateBooktype (data) {
      return api.put('/booktype/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /booktype/delete
    deleteBooktype (data) {
      return api.delete('/booktype/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /book/create
    createBook (data) {
      return api.post('/book/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /book/list
    getBookList (data, noLoading = false) {
      return api.get('/book/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /book/detail
    getBookDetail (data) {
      return api.get('/book/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /book/update
    updateBook (data) {
      return api.put('/book/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /book/delete
    deleteBook (data) {
      return api.delete('/book/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // /backup/create
    createBackup (data) {
      return api.post('/backup/create', data, {
        shouldAdminJWT: true
      })
    },
    // /backup/list
    getBackupList (data) {
      return api.get('/backup/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // /backup/delete
    deleteBackup (data) {
      return api.delete('/backup/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // /backup/detail
    getBackupDetail (data) {
      return api.get('/backup/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // /backup/update
    updateBackup (data) {
      return api.put('/backup/update', data, {
        shouldAdminJWT: true
      })
    },
    // /backup/download/token
    getDownloadBackupToken (data) {
      return api.get('/backup/download/token', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /backup/restore
    restoreBackup (data) {
      return api.post('/backup/restore', data, {
        shouldAdminJWT: true
      })
    },
    // post /backup/upload/create
    createBackupUpload (data) {
      return api.post('/backup/upload/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /backup/upload/chunk/list
    getBackupUploadChunkList (data) {
      return api.get('/backup/upload/chunk/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /backup/upload/chunk/:id/:chunkindex
    uploadBackupUploadChunk (id, chunkindex, data) {
      return api.post(`/backup/upload/chunk/${id}/${chunkindex}`, data, {
        shouldAdminJWT: true,
        noLoading: true
      })
    },
    // put /backup/upload/merge
    mergeUploadBackupFile (data) {
      return api.put('/backup/upload/merge', data, {
        shouldAdminJWT: true
      })
    },
    // get /user/list
    getUserList (data, noLoading = false) {
      return api.get('/user/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /user/update
    getUserDetail (data) {
      return api.get('/user/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /user/update
    updateUser (data) {
      return api.put('/user/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /user/delete
    deleteUser (data) {
      return api.delete('/user/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // post /user/create
    createUser (data) {
      return api.post('/user/create', data, {
        shouldAdminJWT: true
      })
    },
    // post /vote/create
    createVote (data) {
      return api.post('/vote/create', data, {
        shouldAdminJWT: true
      })
    },
    // get /vote/list
    getVoteList (data, noLoading = false) {
      return api.get('/vote/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    },
    // get /vote/detail
    getVoteDetail (data) {
      return api.get('/vote/detail', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // put /vote/update
    updateVote (data) {
      return api.put('/vote/update', data, {
        shouldAdminJWT: true
      })
    },
    // delete /vote/delete
    deleteVote (data) {
      return api.delete('/vote/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // delete /votelog/delete
    deleteVoteLog (data) {
      return api.delete('/votelog/delete', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /votelog/list
    getVoteLogList (data) {
      return api.get('/votelog/list', {
        params: data,
        shouldAdminJWT: true
      })
    },
    // get /votelog/stats
    getVoteLogStats () {
      return api.get('/votelog/stats', {
        shouldAdminJWT: true
      })
    },
  }
}
