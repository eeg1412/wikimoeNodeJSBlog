// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/attachment/list`
const getAttachmentListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

export { getAttachmentListApiFetch }
