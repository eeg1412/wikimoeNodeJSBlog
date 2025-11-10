import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/link/list`
const getLinkListApi = () => {
  return httpRequest.get(URL)
}

export { getLinkListApi }
