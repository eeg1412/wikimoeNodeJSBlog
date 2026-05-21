import httpRequest, { multilingualRequest } from '~/api'
import { assertLanguageCode } from '@/lang'

// 这里只保留业务端点，baseURL 由 ~/api 中的请求实例决定。
const URL = `/options`

/**
 * @description 介绍：查询源站配置项；输入：无。
 * @returns {Promise<any>} 输出：源站配置项响应。
 */
const getOptionsApi = () => {
  return httpRequest.get(URL)
}

/**
 * @description 介绍：从调用参数里读取并校验多语言 options 请求所需的语言码。
 * @param {object} [params={}] 输入：请求参数。
 * @param {object} [options={}] 输入：请求配置。
 * @returns {string} 输出：标准语言码字符串。
 */
function getRequestLanguageCode(params = {}, options = {}) {
  if (options.languageCode) {
    return assertLanguageCode(options.languageCode)
  }

  return assertLanguageCode(params.languageCode)
}

/**
 * @description 介绍：组装多语言 options 请求参数，确保 languageCode 一定随请求发送。
 * @param {object} [params={}] 输入：原始请求参数。
 * @param {object} [options={}] 输入：请求配置。
 * @returns {object} 输出：带 languageCode 的请求参数对象。
 */
function getMultilingualRequestParams(params = {}, options = {}) {
  const requestParams = { ...params }
  requestParams.languageCode = getRequestLanguageCode(params, options)
  return requestParams
}

/**
 * @description 介绍：查询多语言配置项。
 * @param {object} [params={}] 输入：请求参数。
 * @param {object} [options={}] 输入：请求配置。
 * @returns {Promise<any>} 输出：多语言配置项响应。
 */
const getMultilingualOptionsApi = (params = {}, options = {}) => {
  const { languageCode, ...requestOptions } = options
  const requestParams = getMultilingualRequestParams(params, { languageCode })
  return multilingualRequest.getFetch(URL, requestParams, requestOptions)
}

export { getOptionsApi, getMultilingualOptionsApi }
