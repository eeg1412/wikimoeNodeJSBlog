// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/game/list`
const getGameListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params, { watch: false })
}
const getGameListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

// detail
const URL_DETAIL = `/game/detail`
const getGameDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL_DETAIL, siteRequest.params, {
    watch: false
  })
}
const getGameDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL_DETAIL, siteRequest.params)
}

const URL2 = `/game/platform/list`
const getGamePlatformListApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL2, siteRequest.params, { watch: false })
}

// /game/playing/list
const URL3 = `/game/playing/list`
const getGamePlayingListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL3, siteRequest.params, { watch: false })
}

export {
  getGameListApi,
  getGameListApiFetch,
  getGameDetailApi,
  getGameDetailApiFetch,
  getGamePlatformListApi,
  getGamePlayingListApi
}
