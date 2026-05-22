// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const POSTURL = `/trend/post/list`
const getTrendPostListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(POSTURL, params)
  }
  return httpRequest.get(POSTURL, params)
}

export { getTrendPostListApi }
