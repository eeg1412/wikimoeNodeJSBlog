import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/navi/list`
const getNaviListApi = (params = {}, options = {}) => {
  const siteRequest = resolveSiteRequest(params, options)
  return siteRequest.request.get(URL, siteRequest.params, options)
}

const getNaviListFetchApi = (params = {}, options = {}) => {
  const siteRequest = resolveSiteRequest(params, options)
  return siteRequest.request.getFetch(URL, siteRequest.params, options)
}

export { getNaviListApi, getNaviListFetchApi }
