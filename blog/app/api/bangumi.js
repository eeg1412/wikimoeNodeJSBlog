// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/bangumi/list`
const getBangumiListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params, { watch: false })
}
const getBangumiListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

// detail
const URL1 = `/bangumi/detail`
const getBangumiDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL1, siteRequest.params, { watch: false })
}
const getBangumiDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL1, siteRequest.params)
}

// /bangumi/year/list
const URL2 = `/bangumi/year/list`
const getBangumiYearListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL2, siteRequest.params, { watch: false })
}

// /bangumi/season/list
const URL3 = `/bangumi/season/list`
const getBangumiSeasonListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL3, siteRequest.params, { watch: false })
}

export {
  getBangumiListApi,
  getBangumiListApiFetch,
  getBangumiDetailApi,
  getBangumiDetailApiFetch,
  getBangumiYearListApi,
  getBangumiSeasonListApi
}
