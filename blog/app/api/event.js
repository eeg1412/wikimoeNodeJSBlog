// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/event/list`
const getEventListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

// /event/detail
const URL_DETAIL = `/event/detail`
const getEventDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL_DETAIL, params)
  }
  return httpRequest.getFetch(URL_DETAIL, params)
}

export { getEventListApiFetch, getEventDetailApiFetch }
