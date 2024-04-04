// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/book/list`
const getBookListApi = (params: any) => {
  return httpRequest.get(URL, params)
}
const getBookListApiFetch = (params: any) => {
  return httpRequest.get(URL, params)
}

const URL2 = `/booktype/list`
const getBooktypeListApi = (params: any) => {
  return httpRequest.get(URL2, params)
}

export { getBookListApi, getBookListApiFetch, getBooktypeListApi }
