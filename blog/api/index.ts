import type { UseFetchOptions } from 'nuxt/app'

type Methods = 'GET' | 'POST' | 'DELETE' | 'PUT'

const BASE_URL = '/api/blog'

export interface IResultData<T> {
  code: number
  data: T
  msg: string
}

class HttpRequest {
  request<T = any>(
    url: string,
    method: Methods,
    data: any,
    options?: UseFetchOptions<T>
  ) {
    return new Promise((resolve, reject) => {
      const newOptions: UseFetchOptions<T> = {
        baseURL: BASE_URL,
        method: method,
        ...options,
      }

      if (method === 'GET' || method === 'DELETE') {
        newOptions.params = data
      }
      if (method === 'POST' || method === 'PUT') {
        newOptions.body = data
      }
      useFetch(url, newOptions)
        .then((res) => {
          if (res.error?.value) {
            const statusCode = res.error?.value?.statusCode
            console.log('statusCode', statusCode)
            showError({
              statusCode: statusCode || 500,
              message: '发生一点小意外',
            })
          } else {
            resolve(res)
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  requestFetch(url: string, options: any) {
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
          'wmb-request-id': uuid,
        }
      }
    }
    return new Promise((resolve, reject) => {
      $fetch(url, options)
        .then((res: any) => {
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 封装常用方法

  get<T = any>(url: string, params?: any, options?: UseFetchOptions<T>) {
    return this.request(url, 'GET', params, options)
  }

  post<T = any>(url: string, data: any, options?: UseFetchOptions<T>) {
    return this.request(url, 'POST', data, options)
  }

  put<T = any>(url: string, data: any, options?: UseFetchOptions<T>) {
    return this.request(url, 'PUT', data, options)
  }

  delete<T = any>(url: string, params: any, options?: UseFetchOptions<T>) {
    return this.request(url, 'DELETE', params, options)
  }

  // requestFetch
  getFetch(url: string, data: any, options: any = {}) {
    options.method = 'GET'
    options.baseURL = BASE_URL
    options.params = data
    return this.requestFetch(url, options)
  }

  postFetch(url: string, data: any, options?: any) {
    options.method = 'POST'
    options.baseURL = BASE_URL
    options.body = data
    return this.requestFetch(url, options)
  }

  putFetch(url: string, data: any, options?: any) {
    options.method = 'PUT'
    options.baseURL = BASE_URL
    options.body = data
    return this.requestFetch(url, options)
  }

  deleteFetch(url: string, data: any, options?: any) {
    options.method = 'DELETE'
    options.baseURL = BASE_URL
    options.params = data
    return this.requestFetch(url, options)
  }
}

const httpRequest = new HttpRequest()

export default httpRequest
