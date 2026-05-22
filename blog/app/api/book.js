// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/book/list`
const getBookListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params, { watch: false })
  }
  return httpRequest.get(URL, params, { watch: false })
}
const getBookListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/book/detail`
const getBookDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL_DETAIL, params, { watch: false })
  }
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getBookDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL_DETAIL, params)
  }
  return httpRequest.getFetch(URL_DETAIL, params)
}

const URL2 = `/booktype/list`
const getBooktypeListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL2, params, { watch: false })
  }
  return httpRequest.get(URL2, params, { watch: false })
}

// /book/reading/list
const URL3 = `/book/reading/list`
const getBookReadingListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL3, params, { watch: false })
  }
  return httpRequest.get(URL3, params, { watch: false })
}

export {
  getBookListApi,
  getBookListApiFetch,
  getBookDetailApi,
  getBookDetailApiFetch,
  getBooktypeListApi,
  getBookReadingListApi
}
