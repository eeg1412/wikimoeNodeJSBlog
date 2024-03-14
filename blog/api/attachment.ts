// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/attachment/list`
const getAttachmentListApi = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

export { getAttachmentListApi }
