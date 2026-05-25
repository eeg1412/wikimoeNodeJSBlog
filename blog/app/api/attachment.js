// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/attachment/list`
const getAttachmentListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

export { getAttachmentListApiFetch }
