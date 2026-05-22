import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 获取地图标记点列表
 * @return {any} 返回地图标记点列表
 */
const URL = `/mappoint/list`
const getMappointListApi = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(URL, params)
  }
  return httpRequest.get(URL, params)
}

/**
 * @description 获取地图标记点详情
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @return {any} 返回地图标记点详情
 */
const detailURL = `/mappoint/detail`
const getMappointDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(detailURL, params)
  }
  return httpRequest.get(detailURL, params)
}

/**
 * @description 获取地图标记点相关文章列表
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @param {number} params.page - 页码
 * @return {any} 返回文章列表
 */
const postListURL = `/mappoint/post/list`
const getMappointPostListApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.get(postListURL, params)
  }
  return httpRequest.get(postListURL, params)
}

/**
 * @description 获取地图标记点列表 (Fetch版本)
 * @return {any} 返回地图标记点列表
 */
const getMappointListApiFetch = (params = {}) => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(URL, params)
  }
  return httpRequest.getFetch(URL, params)
}

/**
 * @description 获取地图标记点详情 (Fetch版本)
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @return {any} 返回地图标记点详情
 */
const getMappointDetailApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(detailURL, params)
  }
  return httpRequest.getFetch(detailURL, params)
}

/**
 * @description 获取地图标记点相关文章列表 (Fetch版本)
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @param {number} params.page - 页码
 * @return {any} 返回文章列表
 */
const getMappointPostListApiFetch = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(postListURL, params)
  }
  return httpRequest.getFetch(postListURL, params)
}

export {
  getMappointListApi,
  getMappointDetailApi,
  getMappointPostListApi,
  getMappointListApiFetch,
  getMappointDetailApiFetch,
  getMappointPostListApiFetch
}
