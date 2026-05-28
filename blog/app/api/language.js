import { multilingualRequest } from '~/api'

const languageEnabledMapURL = `/language/enabled-map`

/**
 * @description 介绍：查询多语言站博客语言启用状态。
 * @param {object} [params={}] 输入：请求参数。
 * @param {object} [options={}] 输入：useFetch 配置。
 * @returns {Promise<any>} 输出：语言启用状态响应。
 */
const getMultilingualLanguageEnabledMapApi = (params = {}, options = {}) => {
  return multilingualRequest.get(languageEnabledMapURL, params, options)
}

export { getMultilingualLanguageEnabledMapApi }
