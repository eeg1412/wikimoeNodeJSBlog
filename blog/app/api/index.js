import {
  getLanguageText,
  normalizeLanguageCode
} from '@/lang'
import { resolveDefaultLanguageCode } from '@/utils/default-language'

// API base 统一在请求客户端层维护，业务 API 文件只选择请求实例。
const BLOG_BASE_URL = '/api/blog'
const MULTILINGUAL_BASE_URL = '/api/multilingual-blog'

/**
 * @description 介绍：从请求参数或请求配置中读取标准语言码。
 * @param {any} data 输入：查询参数或请求体。
 * @param {object} [options={}] 输入：请求配置。
 * @returns {string} 输出：标准语言码；无语言码时返回默认语言。
 */
function getRequestLanguageCode(data, options = {}) {
  const optionLanguageCode = normalizeLanguageCode(options?.languageCode)
  if (optionLanguageCode) {
    return optionLanguageCode
  }

  if (data && typeof data === 'object') {
    const dataLanguageCode = normalizeLanguageCode(data.languageCode)
    if (dataLanguageCode) {
      return dataLanguageCode
    }
  }

  try {
    const currentOptions = useState('options', () => null)
    return resolveDefaultLanguageCode(currentOptions.value)
  } catch {
    return resolveDefaultLanguageCode(null)
  }
}

/**
 * @description 介绍：按请求语言生成接口维护错误文案。
 * @param {any} data 输入：查询参数或请求体。
 * @param {object} [options={}] 输入：请求配置。
 * @returns {string} 输出：本地化后的错误文案。
 */
function getRequestMaintenanceMessage(data, options = {}) {
  return getLanguageText(
    getRequestLanguageCode(data, options),
    'common.error.maintenance'
  )
}

class HttpRequest {
  /**
   * @description 介绍：保存当前请求实例对应的 API base。
   * @param {string} baseURL 输入：请求实例使用的 API 前缀。
   * @returns {void} 输出：无返回值。
   */
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  /**
   * @description 介绍：使用 useFetch 发起会参与 Nuxt 响应式缓存的请求。
   * @param {string} url 输入：请求路径。
   * @param {'GET'|'POST'|'PUT'|'DELETE'} method 输入：HTTP 方法。
   * @param {any} data 输入：查询参数或请求体。
   * @param {object} [options] 输入：useFetch 配置。
   * @returns {Promise<any>} 输出：useFetch 响应 Promise。
   */
  request(url, method, data, options) {
    /**
     * @description 介绍：包装 useFetch 调用并统一处理成功与错误响应。
     * @param {(value: any) => void} resolve 输入：Promise 成功回调。
     * @param {(reason?: any) => void} reject 输入：Promise 失败回调。
     * @returns {void} 输出：无返回值。
     */
    function runRequest(resolve, reject) {
      const newOptions = {
        baseURL: this.baseURL,
        method: method,
        ...options
      }
      // 某些非关键 SSR 辅助接口失败时只需要让调用方自行处理，不应该触发全局错误页。
      const shouldSkipErrorPage = newOptions.shouldSkipErrorPage
      delete newOptions.shouldSkipErrorPage

      if (method === 'GET' || method === 'DELETE') {
        newOptions.params = data
      }
      if (method === 'POST' || method === 'PUT') {
        newOptions.body = data
      }

      /**
       * @description 介绍：处理 useFetch 返回值，并在接口错误时触发全局错误页。
       * @param {any} res 输入：useFetch 返回的响应对象。
       * @returns {void} 输出：无返回值。
       */
      function handleFetchResponse(res) {
        if (res.error?.value) {
          const requestError = res.error.value
          const statusCode = requestError?.statusCode
          if (!shouldSkipErrorPage) {
            // 多语言请求失败时使用当前请求语言展示错误，并 reject，避免调用方 await 长时间悬空。
            showError({
              statusCode: statusCode || 500,
              message: getRequestMaintenanceMessage(data, options)
            })
          }
          reject(requestError)
        } else {
          resolve(res)
        }
      }

      /**
       * @description 介绍：处理 useFetch 自身抛出的异常。
       * @param {any} error 输入：请求异常对象。
       * @returns {void} 输出：无返回值。
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
   * @description 介绍：使用 $fetch 发起直接请求，并统一注入客户端认证请求头。
   * @param {string} url 输入：请求路径。
   * @param {object} options 输入：$fetch 配置。
   * @returns {Promise<any>} 输出：$fetch 响应 Promise。
   */
  requestFetch(url, options = {}) {
    // 克隆请求配置，避免多语言和源站请求复用同一个 options 对象时互相污染。
    const requestOptions = { ...options }
    // 查看options内包含shouldUuid
    const shouldUuid = requestOptions.shouldUuid
    delete requestOptions.shouldUuid
    // 如果有就去本地拿uuid
    if (shouldUuid && import.meta.client) {
      const uuid = checkUuid()
      if (uuid) {
        requestOptions.headers = {
          ...requestOptions.headers,
          // 将uuid放入请求头 wmb-request-id
          'wmb-request-id': uuid
        }
      }
    }
    // 查看options内包含shouldCommentRetractJWT
    const shouldCommentRetractJWT = requestOptions.shouldCommentRetractJWT
    delete requestOptions.shouldCommentRetractJWT
    // 如果有就去本地拿commentRetractJWT
    if (shouldCommentRetractJWT && import.meta.client) {
      const commentRetractJWT = localStorage.getItem('commentRetractJWT')
      if (commentRetractJWT) {
        requestOptions.headers = {
          ...requestOptions.headers,
          // 将commentRetractJWT放入请求头 comment-retract-jwt
          'wm-comment-retract-authorization': `Bearer ${commentRetractJWT}`
        }
      }
    }
    /**
     * @description 介绍：包装 $fetch 调用，保持和 request 方法一致的 Promise 形态。
     * @param {(value: any) => void} resolve 输入：Promise 成功回调。
     * @param {(reason?: any) => void} reject 输入：Promise 失败回调。
     * @returns {void} 输出：无返回值。
     */
    function runFetch(resolve, reject) {
      /**
       * @description 介绍：处理 $fetch 成功响应。
       * @param {any} res 输入：$fetch 返回的数据。
       * @returns {void} 输出：无返回值。
       */
      function handleFetchSuccess(res) {
        resolve(res)
      }

      /**
       * @description 介绍：处理 $fetch 异常响应。
       * @param {any} error 输入：请求异常对象。
       * @returns {void} 输出：无返回值。
       */
      function handleFetchFailure(error) {
        reject(error)
      }

      $fetch(url, requestOptions)
        .then(handleFetchSuccess)
        .catch(handleFetchFailure)
    }

    return new Promise(runFetch)
  }

  // 封装常用方法

  /**
   * @description 介绍：发起 GET 请求。
   * @param {string} url 输入：请求路径。
   * @param {object} [params] 输入：查询参数。
   * @param {object} [options] 输入：useFetch 配置。
   * @returns {Promise<any>} 输出：useFetch 响应 Promise。
   */
  get(url, params, options) {
    return this.request(url, 'GET', params, options)
  }

  /**
   * @description 介绍：发起 POST 请求。
   * @param {string} url 输入：请求路径。
   * @param {any} data 输入：请求体。
   * @param {object} [options] 输入：useFetch 配置。
   * @returns {Promise<any>} 输出：useFetch 响应 Promise。
   */
  post(url, data, options) {
    return this.request(url, 'POST', data, options)
  }

  /**
   * @description 介绍：发起 PUT 请求。
   * @param {string} url 输入：请求路径。
   * @param {any} data 输入：请求体。
   * @param {object} [options] 输入：useFetch 配置。
   * @returns {Promise<any>} 输出：useFetch 响应 Promise。
   */
  put(url, data, options) {
    return this.request(url, 'PUT', data, options)
  }

  /**
   * @description 介绍：发起 DELETE 请求。
   * @param {string} url 输入：请求路径。
   * @param {object} [params] 输入：查询参数。
   * @param {object} [options] 输入：useFetch 配置。
   * @returns {Promise<any>} 输出：useFetch 响应 Promise。
   */
  delete(url, params, options) {
    return this.request(url, 'DELETE', params, options)
  }

  // getFetch 系列同样使用实例 baseURL，避免调用方在业务层手写接口前缀。
  /**
   * @description 介绍：使用 $fetch 发起 GET 请求。
   * @param {string} url 输入：请求路径。
   * @param {object} [data] 输入：查询参数。
   * @param {object} [options={}] 输入：$fetch 配置。
   * @returns {Promise<any>} 输出：$fetch 响应数据 Promise。
   */
  getFetch(url, data, options = {}) {
    const requestOptions = {
      ...options,
      method: 'GET',
      baseURL: this.baseURL,
      params: data
    }
    return this.requestFetch(url, requestOptions)
  }

  /**
   * @description 介绍：使用 $fetch 发起 POST 请求。
   * @param {string} url 输入：请求路径。
   * @param {any} data 输入：请求体。
   * @param {object} [options={}] 输入：$fetch 配置。
   * @returns {Promise<any>} 输出：$fetch 响应数据 Promise。
   */
  postFetch(url, data, options = {}) {
    const requestOptions = {
      ...options,
      method: 'POST',
      baseURL: this.baseURL,
      body: data
    }
    return this.requestFetch(url, requestOptions)
  }

  /**
   * @description 介绍：使用 $fetch 发起 PUT 请求。
   * @param {string} url 输入：请求路径。
   * @param {any} data 输入：请求体。
   * @param {object} [options={}] 输入：$fetch 配置。
   * @returns {Promise<any>} 输出：$fetch 响应数据 Promise。
   */
  putFetch(url, data, options = {}) {
    const requestOptions = {
      ...options,
      method: 'PUT',
      baseURL: this.baseURL,
      body: data
    }
    return this.requestFetch(url, requestOptions)
  }

  /**
   * @description 介绍：使用 $fetch 发起 DELETE 请求。
   * @param {string} url 输入：请求路径。
   * @param {object} [data] 输入：查询参数。
   * @param {object} [options={}] 输入：$fetch 配置。
   * @returns {Promise<any>} 输出：$fetch 响应数据 Promise。
   */
  deleteFetch(url, data, options = {}) {
    const requestOptions = {
      ...options,
      method: 'DELETE',
      baseURL: this.baseURL,
      params: data
    }
    return this.requestFetch(url, requestOptions)
  }
}

const httpRequest = new HttpRequest(BLOG_BASE_URL)
const multilingualRequest = new HttpRequest(MULTILINGUAL_BASE_URL)

// 默认实例服务源站接口；多语言内容接口显式使用 multilingualRequest。
export { multilingualRequest }
export default httpRequest
