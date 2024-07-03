// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/trend/list`
const getTrendListApi = (params: any) => {
  return httpRequest.get(URL, params)
}

export { getTrendListApi }
