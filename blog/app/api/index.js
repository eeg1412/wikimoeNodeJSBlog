const BASE_URL = '/api/blog'

class HttpRequest {
  request(url, method, data, options) {
    return new Promise((resolve, reject) => {
      const newOptions = {
        baseURL: BASE_URL,
        method: method,
        ...options
      }

      if (method === 'GET' || method === 'DELETE') {
        newOptions.params = data
      }
      if (method === 'POST' || method === 'PUT') {
        newOptions.body = data
      }
      useFetch(url, newOptions)
        .then(res => {
          if (res.error?.value) {
            const status =
              res.error?.value?.status || res.error?.value?.statusCode
            console.log('status', status)
            showError({
              status: status || 500,
              message: '服务器正在维护中，请稍后再试。'
            })
          } else {
            resolve(res)
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  requestFetch(url, options) {
    // 查看options内包含shouldUuid
    const shouldUuid = options.shouldUuid
    // 如果有就去本地拿uuid
    if (shouldUuid && import.meta.client) {
      const uuid = checkUuid()
      // 删除shouldUuid
      delete options.shouldUuid
      if (uuid) {
        options.headers = {
          ...options.headers,
          // 将uuid放入请求头 wmb-request-id
          'wmb-request-id': uuid
        }
      }
    }
    // 查看options内包含shouldCommentRetractJWT
    const shouldCommentRetractJWT = options.shouldCommentRetractJWT
    // 如果有就去本地拿commentRetractJWT
    if (shouldCommentRetractJWT && import.meta.client) {
      const commentRetractJWT = localStorage.getItem('commentRetractJWT')
      // 删除shouldCommentRetractJWT
      delete options.shouldCommentRetractJWT
      if (commentRetractJWT) {
        options.headers = {
          ...options.headers,
          // 将commentRetractJWT放入请求头 comment-retract-jwt
          'wm-comment-retract-authorization': `Bearer ${commentRetractJWT}`
        }
      }
    }
    return new Promise((resolve, reject) => {
      $fetch(url, options)
        .then(res => {
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  // 封装常用方法

  get(url, params, options) {
    return this.request(url, 'GET', params, options)
  }

  post(url, data, options) {
    return this.request(url, 'POST', data, options)
  }

  put(url, data, options) {
    return this.request(url, 'PUT', data, options)
  }

  delete(url, params, options) {
    return this.request(url, 'DELETE', params, options)
  }

  // requestFetch
  getFetch(url, data, options = {}) {
    options.method = 'GET'
    options.baseURL = BASE_URL
    options.params = data
    return this.requestFetch(url, options)
  }

  postFetch(url, data, options) {
    options.method = 'POST'
    options.baseURL = BASE_URL
    options.body = data
    return this.requestFetch(url, options)
  }

  putFetch(url, data, options) {
    options.method = 'PUT'
    options.baseURL = BASE_URL
    options.body = data
    return this.requestFetch(url, options)
  }

  deleteFetch(url, data, options) {
    options.method = 'DELETE'
    options.baseURL = BASE_URL
    options.params = data
    return this.requestFetch(url, options)
  }
}

const httpRequest = new HttpRequest()

export default httpRequest
