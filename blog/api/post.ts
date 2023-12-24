import httpRequest from '~/api'

/**
 * @description 查询文章
 * @return {any} 返回文章
 */
interface GetPostsParams {
  page?: number
  keyword?: string
  pageType?: string
  sortid?: string
  year?: string
  month?: string
  tags?: string
}
const URL = `/post/list`
const getPostsApi = (params: GetPostsParams) => {
  return httpRequest.get(URL, params)
}

// '/post/archive'
const archiveURL = `/post/archive`
const getArchiveApi = () => {
  return httpRequest.get(archiveURL)
}
// '/post/detail'
interface PostDetailParams {
  id: string
}
const detailURL = `/post/detail`
const getDetailApi = (params: PostDetailParams) => {
  return httpRequest.get(`${detailURL}`, params)
}
//put  /post/view/count
const viewCountURL = `/post/view/count`
const putViewCountApi = (params: any) => {
  return httpRequest.putFetch(`${viewCountURL}`, params, {
    shouldUuid: true,
  })
}
export { getPostsApi, getArchiveApi, getDetailApi, putViewCountApi }
