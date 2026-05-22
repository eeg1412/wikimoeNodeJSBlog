// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/game/list`
const getGameListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params, { watch: false })
  }
  return httpRequest.get(URL, params, { watch: false })
}
const getGameListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

// detail
const URL_DETAIL = `/game/detail`
const getGameDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL_DETAIL, params, { watch: false })
  }
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getGameDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL_DETAIL, params)
  }
  return httpRequest.getFetch(URL_DETAIL, params)
}

const URL2 = `/game/platform/list`
const getGamePlatformListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL2, params, { watch: false })
  }
  return httpRequest.get(URL2, params, { watch: false })
}

// /game/playing/list
const URL3 = `/game/playing/list`
const getGamePlayingListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL3, params, { watch: false })
  }
  return httpRequest.get(URL3, params, { watch: false })
}

export {
  getGameListApi,
  getGameListApiFetch,
  getGameDetailApi,
  getGameDetailApiFetch,
  getGamePlatformListApi,
  getGamePlayingListApi
}
