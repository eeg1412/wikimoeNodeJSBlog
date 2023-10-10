export default function (api) {
  return {
    login (data) {
      return api.post('/admin/login', data)
    },
  }
}
