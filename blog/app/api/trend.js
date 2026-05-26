// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const POSTURL = `/trend/post/list`
const getTrendPostListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(POSTURL, siteRequest.params)
}

const getTrendPostListFetchApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(POSTURL, siteRequest.params)
}

export { getTrendPostListApi, getTrendPostListFetchApi }
