// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/comment/latest`
const getCommentLatestApi = () => {
  return httpRequest.get(URL)
}
// /comment/list
const commentListURL = `/comment/list`
const getCommentListApi = (params: any, options: any) => {
  return httpRequest.getFetch(commentListURL, params, options)
}
// /comment/create
const commentCreateURL = `/comment/create`
const getCommentCreateApi = (params: any, options: any) => {
  return httpRequest.postFetch(commentCreateURL, params, {
    ...options,
    shouldUuid: true,
  })
}

export { getCommentLatestApi, getCommentListApi, getCommentCreateApi }
