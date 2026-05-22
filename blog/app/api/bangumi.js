// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/bangumi/list`
const getBangumiListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params, { watch: false })
  }
  return httpRequest.get(URL, params, { watch: false })
}
const getBangumiListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

// detail
const URL1 = `/bangumi/detail`
const getBangumiDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL1, params, { watch: false })
  }
  return httpRequest.get(URL1, params, { watch: false })
}
const getBangumiDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL1, params)
  }
  return httpRequest.getFetch(URL1, params)
}

// /bangumi/year/list
const URL2 = `/bangumi/year/list`
const getBangumiYearListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL2, params, { watch: false })
  }
  return httpRequest.get(URL2, params, { watch: false })
}

// /bangumi/season/list
const URL3 = `/bangumi/season/list`
const getBangumiSeasonListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL3, params, { watch: false })
  }
  return httpRequest.get(URL3, params, { watch: false })
}

export {
  getBangumiListApi,
  getBangumiListApiFetch,
  getBangumiDetailApi,
  getBangumiDetailApiFetch,
  getBangumiYearListApi,
  getBangumiSeasonListApi
}
