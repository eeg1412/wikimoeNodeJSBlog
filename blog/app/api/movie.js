// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/movie/list`
const getMovieListApi = params => {
  return httpRequest.get(URL, params, { watch: false })
}
const getMovieListApiFetch = params => {
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/movie/detail`
const getMovieDetailApi = params => {
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getMovieDetailApiFetch = params => {
  return httpRequest.getFetch(URL_DETAIL, params)
}

// /movie/year/list
const URL_YEAR = `/movie/year/list`
const getMovieYearListApi = params => {
  return httpRequest.get(URL_YEAR, params, { watch: false })
}

export {
  getMovieListApi,
  getMovieListApiFetch,
  getMovieDetailApi,
  getMovieDetailApiFetch,
  getMovieYearListApi
}
