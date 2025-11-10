// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/book/list`
const getBookListApi = params => {
  return httpRequest.get(URL, params, { watch: false })
}
const getBookListApiFetch = params => {
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/book/detail`
const getBookDetailApi = params => {
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getBookDetailApiFetch = params => {
  return httpRequest.getFetch(URL_DETAIL, params)
}

const URL2 = `/booktype/list`
const getBooktypeListApi = params => {
  return httpRequest.get(URL2, params, { watch: false })
}

// /book/reading/list
const URL3 = `/book/reading/list`
const getBookReadingListApi = params => {
  return httpRequest.get(URL3, { watch: false })
}

export {
  getBookListApi,
  getBookListApiFetch,
  getBookDetailApi,
  getBookDetailApiFetch,
  getBooktypeListApi,
  getBookReadingListApi
}
