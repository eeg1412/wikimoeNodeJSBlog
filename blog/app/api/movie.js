// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/movie/list`
const getMovieListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params, { watch: false })
  }
  return httpRequest.get(URL, params, { watch: false })
}
const getMovieListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/movie/detail`
const getMovieDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL_DETAIL, params, { watch: false })
  }
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getMovieDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL_DETAIL, params)
  }
  return httpRequest.getFetch(URL_DETAIL, params)
}

// /movie/year/list
const URL_YEAR = `/movie/year/list`
const getMovieYearListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL_YEAR, params, { watch: false })
  }
  return httpRequest.get(URL_YEAR, params, { watch: false })
}

export {
  getMovieListApi,
  getMovieListApiFetch,
  getMovieDetailApi,
  getMovieDetailApiFetch,
  getMovieYearListApi
}
