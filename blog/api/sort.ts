// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/sort/list`
const getSortListApi = () => {
  return httpRequest.get(URL)
}
// /sort/detail
const URL_DETAIL = `/sort/detail`
const getSortDetailApi = (params: any) => {
  return httpRequest.get(URL_DETAIL, params)
}

export { getSortListApi, getSortDetailApi }
