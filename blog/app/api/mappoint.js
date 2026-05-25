import { resolveSiteRequest } from '~/api'

/**
 * @description 获取地图标记点列表
 * @return {any} 返回地图标记点列表
 */
const URL = `/mappoint/list`
const getMappointListApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params)
}

/**
 * @description 获取地图标记点详情
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @return {any} 返回地图标记点详情
 */
const detailURL = `/mappoint/detail`
const getMappointDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(detailURL, siteRequest.params)
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
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(postListURL, siteRequest.params)
}

/**
 * @description 获取地图标记点列表 (Fetch版本)
 * @return {any} 返回地图标记点列表
 */
const getMappointListApiFetch = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(URL, siteRequest.params)
}

/**
 * @description 获取地图标记点详情 (Fetch版本)
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @return {any} 返回地图标记点详情
 */
const getMappointDetailApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(detailURL, siteRequest.params)
}

/**
 * @description 获取地图标记点相关文章列表 (Fetch版本)
 * @param {object} params - 参数对象
 * @param {string} params.id - 地图标记点ID
 * @param {number} params.page - 页码
 * @return {any} 返回文章列表
 */
const getMappointPostListApiFetch = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(postListURL, siteRequest.params)
}

export {
  getMappointListApi,
  getMappointDetailApi,
  getMappointPostListApi,
  getMappointListApiFetch,
  getMappointDetailApiFetch,
  getMappointPostListApiFetch
}
