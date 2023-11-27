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
    updatePost (data) {
      return api.put('/post/update', data, {
        shouldAdminJWT: true
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
  }
}
