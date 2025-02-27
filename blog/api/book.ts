// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/book/list`
const getBookListApi = (params: any) => {
  return httpRequest.get(URL, params, { watch: false })
}
const getBookListApiFetch = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

const URL2 = `/booktype/list`
const getBooktypeListApi = (params: any) => {
  return httpRequest.get(URL2, params, { watch: false })
}

// /book/reading/list
const URL3 = `/book/reading/list`
const getBookReadingListApi = (params: any) => {
  return httpRequest.get(URL3, { watch: false })
}

export {
  getBookListApi,
  getBookListApiFetch,
  getBooktypeListApi,
  getBookReadingListApi,
}
