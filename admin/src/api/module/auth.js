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
  }
}
