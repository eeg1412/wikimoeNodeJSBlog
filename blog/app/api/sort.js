// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/sort/list`
const getSortListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params)
  }
  return httpRequest.get(URL, params)
}
// /sort/detail
const URL_DETAIL = `/sort/detail`
const getSortDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL_DETAIL, params)
  }
  return httpRequest.get(URL_DETAIL, params)
}

export { getSortListApi, getSortDetailApi }
