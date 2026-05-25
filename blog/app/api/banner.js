// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/banner/list`
const getBannerListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params)
}

export { getBannerListApi }
