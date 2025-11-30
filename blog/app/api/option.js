import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/options`
const getOptionsApi = () => {
  return httpRequest.get(URL)
}

/**
 * @description 查询SWR缓存设置
 * @return {any} 返回SWR缓存设置
 */
const getSwrCacheSettingsApi = () => {
  return httpRequest.get('/swr-cache-settings')
}

/**
 * @description 查询缓存版本号
 * @return {any} 返回缓存版本号
 */
const getCacheVersionApi = () => {
  return httpRequest.get('/cache-version')
}

export { getOptionsApi, getSwrCacheSettingsApi, getCacheVersionApi }
