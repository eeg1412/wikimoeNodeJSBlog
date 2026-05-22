import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/navi/list`
const getNaviListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params)
  }
  return httpRequest.get(URL, params)
}

export { getNaviListApi }
