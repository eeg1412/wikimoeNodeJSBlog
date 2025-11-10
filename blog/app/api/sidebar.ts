// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/sidebar/list`
const getSidebarListApi = () => {
  return httpRequest.get(URL)
}

export { getSidebarListApi }
