// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/game/list`
const getGameListApi = (params: any) => {
  return httpRequest.get(URL, params, { watch: false })
}
const getGameListApiFetch = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

const URL2 = `/game/platform/list`
const getGamePlatformListApi = (params: any) => {
  return httpRequest.get(URL2, params, { watch: false })
}

// /game/playing/list
const URL3 = `/game/playing/list`
const getGamePlayingListApi = (params: any) => {
  return httpRequest.get(URL3, { watch: false })
}

export {
  getGameListApi,
  getGameListApiFetch,
  getGamePlatformListApi,
  getGamePlayingListApi
}
