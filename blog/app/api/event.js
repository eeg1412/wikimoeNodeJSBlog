// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/event/list`
const getEventListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

// /event/detail
const URL_DETAIL = `/event/detail`
const getEventDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL_DETAIL, siteRequest.params)
}

export { getEventListApiFetch, getEventDetailApiFetch }
