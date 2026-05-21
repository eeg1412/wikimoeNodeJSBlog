// API base 统一在请求客户端层维护，业务 API 文件只选择请求实例。
const BLOG_BASE_URL = '/api/blog'
const MULTILINGUAL_BASE_URL = '/api/multilingual-blog'

class HttpRequest {
  /**
   * 保存当前请求实例对应的 API base。
   * @param {string} baseURL 请求实例使用的 API 前缀。
   */
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  /**
   * 使用 useFetch 发起会参与 Nuxt 响应式缓存的请求。
   * @param {string} url 请求路径。
   * @param {'GET'|'POST'|'PUT'|'DELETE'} method HTTP 方法。
   * @param {any} data 查询参数或请求体。
   * @param {object} [options] useFetch 配置。
   * @returns {Promise<any>} 返回 useFetch 响应。
   */
  request(url, method, data, options) {
    /**
     * 包装 useFetch 调用并统一处理成功与错误响应。
     * @param {(value: any) => void} resolve Promise 成功回调。
     * @param {(reason?: any) => void} reject Promise 失败回调。
     * @returns {void}
     */
    function runRequest(resolve, reject) {
      const newOptions = {
        baseURL: this.baseURL,
        method: method,
        ...options
      }

      if (method === 'GET' || method === 'DELETE') {
        newOptions.params = data
      }
      if (method === 'POST' || method === 'PUT') {
        newOptions.body = data
      }

      /**
       * 处理 useFetch 返回值，并在接口错误时触发全局错误页。
       * @param {any} res useFetch 返回的响应对象。
       * @returns {void}
       */
      function handleFetchResponse(res) {
        if (res.error?.value) {
          const statusCode = res.error?.value?.statusCode
          console.log('statusCode', statusCode)
          showError({
            statusCode: statusCode || 500,
            message: '服务器正在维护中，请稍后再试。'
          })
        } else {
          resolve(res)
        }
      }

      /**
       * 处理 useFetch 自身抛出的异常。
       * @param {any} error 请求异常对象。
       * @returns {void}
       */
      function handleFetchError(error) {
        reject(error)
      }

      useFetch(url, newOptions)
        .then(handleFetchResponse)
        .catch(handleFetchError)
    }

    return new Promise(runRequest.bind(this))
  }

  /**
   * 使用 $fetch 发起直接请求，并统一注入客户端认证请求头。
   * @param {string} url 请求路径。
   * @param {object} options $fetch 配置。
   * @returns {Promise<any>} 返回 $fetch 响应。
   */
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
    /**
     * 包装 $fetch 调用，保持和 request 方法一致的 Promise 形态。
     * @param {(value: any) => void} resolve Promise 成功回调。
     * @param {(reason?: any) => void} reject Promise 失败回调。
     * @returns {void}
     */
    function runFetch(resolve, reject) {
      /**
       * 处理 $fetch 成功响应。
       * @param {any} res $fetch 返回的数据。
       * @returns {void}
       */
      function handleFetchSuccess(res) {
        resolve(res)
      }

      /**
       * 处理 $fetch 异常响应。
       * @param {any} error 请求异常对象。
       * @returns {void}
       */
      function handleFetchFailure(error) {
        reject(error)
      }

      $fetch(url, options).then(handleFetchSuccess).catch(handleFetchFailure)
    }

    return new Promise(runFetch)
  }

  // 封装常用方法

  /**
   * 发起 GET 请求。
   * @param {string} url 请求路径。
   * @param {object} [params] 查询参数。
   * @param {object} [options] useFetch 配置。
   * @returns {Promise<any>} 返回 useFetch 响应。
   */
  get(url, params, options) {
    return this.request(url, 'GET', params, options)
  }

  /**
   * 发起 POST 请求。
   * @param {string} url 请求路径。
   * @param {any} data 请求体。
   * @param {object} [options] useFetch 配置。
   * @returns {Promise<any>} 返回 useFetch 响应。
   */
  post(url, data, options) {
    return this.request(url, 'POST', data, options)
  }

  /**
   * 发起 PUT 请求。
   * @param {string} url 请求路径。
   * @param {any} data 请求体。
   * @param {object} [options] useFetch 配置。
   * @returns {Promise<any>} 返回 useFetch 响应。
   */
  put(url, data, options) {
    return this.request(url, 'PUT', data, options)
  }

  /**
   * 发起 DELETE 请求。
   * @param {string} url 请求路径。
   * @param {object} [params] 查询参数。
   * @param {object} [options] useFetch 配置。
   * @returns {Promise<any>} 返回 useFetch 响应。
   */
  delete(url, params, options) {
    return this.request(url, 'DELETE', params, options)
  }

  // getFetch 系列同样使用实例 baseURL，避免调用方在业务层手写接口前缀。
  /**
   * 使用 $fetch 发起 GET 请求。
   * @param {string} url 请求路径。
   * @param {object} [data] 查询参数。
   * @param {object} [options={}] $fetch 配置。
   * @returns {Promise<any>} 返回 $fetch 响应数据。
   */
  getFetch(url, data, options = {}) {
    options.method = 'GET'
    options.baseURL = this.baseURL
    options.params = data
    return this.requestFetch(url, options)
  }

  /**
   * 使用 $fetch 发起 POST 请求。
   * @param {string} url 请求路径。
   * @param {any} data 请求体。
   * @param {object} [options={}] $fetch 配置。
   * @returns {Promise<any>} 返回 $fetch 响应数据。
   */
  postFetch(url, data, options = {}) {
    options.method = 'POST'
    options.baseURL = this.baseURL
    options.body = data
    return this.requestFetch(url, options)
  }

  /**
   * 使用 $fetch 发起 PUT 请求。
   * @param {string} url 请求路径。
   * @param {any} data 请求体。
   * @param {object} [options={}] $fetch 配置。
   * @returns {Promise<any>} 返回 $fetch 响应数据。
   */
  putFetch(url, data, options = {}) {
    options.method = 'PUT'
    options.baseURL = this.baseURL
    options.body = data
    return this.requestFetch(url, options)
  }

  /**
   * 使用 $fetch 发起 DELETE 请求。
   * @param {string} url 请求路径。
   * @param {object} [data] 查询参数。
   * @param {object} [options={}] $fetch 配置。
   * @returns {Promise<any>} 返回 $fetch 响应数据。
   */
  deleteFetch(url, data, options = {}) {
    options.method = 'DELETE'
    options.baseURL = this.baseURL
    options.params = data
    return this.requestFetch(url, options)
  }
}

const httpRequest = new HttpRequest(BLOG_BASE_URL)
const multilingualRequest = new HttpRequest(MULTILINGUAL_BASE_URL)

// 默认实例服务源站接口；多语言内容接口显式使用 multilingualRequest。
export { multilingualRequest }
export default httpRequest
