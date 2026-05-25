// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/movie/list`
const getMovieListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params, { watch: false })
}
const getMovieListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

// detail
const URL_DETAIL = `/movie/detail`
const getMovieDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL_DETAIL, siteRequest.params, {
    watch: false
  })
}
const getMovieDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL_DETAIL, siteRequest.params)
}

// /movie/year/list
const URL_YEAR = `/movie/year/list`
const getMovieYearListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL_YEAR, siteRequest.params, {
    watch: false
  })
}

export {
  getMovieListApi,
  getMovieListApiFetch,
  getMovieDetailApi,
  getMovieDetailApiFetch,
  getMovieYearListApi
}
