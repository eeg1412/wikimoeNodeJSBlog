import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/api/blog/options`
const getOptionsApi = () => {
  return httpRequest.get(URL)
}

export { getOptionsApi }
