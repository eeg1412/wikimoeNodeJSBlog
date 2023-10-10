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
  }
}
