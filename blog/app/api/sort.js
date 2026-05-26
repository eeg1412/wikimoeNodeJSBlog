// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/sort/list`
const getSortListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params)
}

const getSortListFetchApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}
// /sort/detail
const URL_DETAIL = `/sort/detail`
const getSortDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL_DETAIL, siteRequest.params)
}

export { getSortListApi, getSortListFetchApi, getSortDetailApi }
