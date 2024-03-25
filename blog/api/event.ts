// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/event/list`
const getEventListApiFetch = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

export { getEventListApiFetch }
