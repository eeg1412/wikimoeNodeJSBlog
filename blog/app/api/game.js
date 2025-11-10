// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/game/list`
const getGameListApi = params => {
  return httpRequest.get(URL, params, { watch: false })
}
const getGameListApiFetch = params => {
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/game/detail`
const getGameDetailApi = params => {
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getGameDetailApiFetch = params => {
  return httpRequest.getFetch(URL_DETAIL, params)
}

const URL2 = `/game/platform/list`
const getGamePlatformListApi = params => {
  return httpRequest.get(URL2, params, { watch: false })
}

// /game/playing/list
const URL3 = `/game/playing/list`
const getGamePlayingListApi = params => {
  return httpRequest.get(URL3, { watch: false })
}

export {
  getGameListApi,
  getGameListApiFetch,
  getGameDetailApi,
  getGameDetailApiFetch,
  getGamePlatformListApi,
  getGamePlayingListApi
}
