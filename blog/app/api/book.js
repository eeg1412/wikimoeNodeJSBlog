// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/book/list`
const getBookListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params, { watch: false })
}
const getBookListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

// detail
const URL_DETAIL = `/book/detail`
const getBookDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL_DETAIL, siteRequest.params, {
    watch: false
  })
}
const getBookDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL_DETAIL, siteRequest.params)
}

const URL2 = `/booktype/list`
const getBooktypeListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL2, siteRequest.params, { watch: false })
}

// /book/reading/list
const URL3 = `/book/reading/list`
const getBookReadingListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL3, siteRequest.params, { watch: false })
}

export {
  getBookListApi,
  getBookListApiFetch,
  getBookDetailApi,
  getBookDetailApiFetch,
  getBooktypeListApi,
  getBookReadingListApi
}
