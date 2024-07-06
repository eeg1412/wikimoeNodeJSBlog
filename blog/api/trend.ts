// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const POSTURL = `/trend/post/list`
const getTrendPostListApi = (params: any) => {
  return httpRequest.get(POSTURL, params)
}

export { getTrendPostListApi }
