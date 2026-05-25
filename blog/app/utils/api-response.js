/**
 * @description 介绍：从接口响应中读取列表数据；输入：接口响应对象或数组。
 * @param {any} response 输入：接口响应。
 * @returns {Array} 输出：列表数据。
 */
export function readApiListResponse(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.data)) {
    return response.data
  }

  return []
}
