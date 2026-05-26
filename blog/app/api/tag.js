// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/tag/detail`
const getTagDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params)
}

// /tag/random/list
const RandomURL = `/tag/random/list`
const getRandomTagListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(RandomURL, siteRequest.params)
}

const getRandomTagListFetchApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(RandomURL, siteRequest.params)
}

export { getTagDetailApi, getRandomTagListApi, getRandomTagListFetchApi }
