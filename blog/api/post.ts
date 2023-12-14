import httpRequest from '~/api'

/**
 * @description 查询文章
 * @return {any} 返回文章
 */

const URL = `/post/list`
const getPostsApi = (params: any) => {
  return httpRequest.get(URL, params)
}

export { getPostsApi }
