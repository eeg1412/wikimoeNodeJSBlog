import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/navi/list`
const getNaviListApi = () => {
  return httpRequest.get(URL)
}

export { getNaviListApi }
