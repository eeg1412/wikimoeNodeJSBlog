import httpRequest, { multilingualRequest, resolveSiteRequest } from '~/api'

/**
 * @description 查询文章
 * @return {any} 返回文章
 */
const URL = `/post/list`
const getPostsApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(URL, siteRequest.params)
}

// '/post/archive'
const archiveURL = `/post/archive`
const getArchiveApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(archiveURL, siteRequest.params)
}
const getArchiveFetchApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(archiveURL, siteRequest.params)
}
// '/post/detail'
const detailURL = `/post/detail`
const getDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.get(`${detailURL}`, siteRequest.params)
}
// '/post/language/existence'
const languageExistenceURL = `/post/language/existence`
const getPostLanguageExistenceApi = (params, options = {}) => {
  return multilingualRequest.get(languageExistenceURL, params, options)
}
//put  /post/view/count
const viewCountURL = `/post/view/count`
const putViewCountApi = params => {
  return httpRequest.putFetch(`${viewCountURL}`, params, {
    shouldUuid: true
  })
}
// put /post/share/count
const shareCountURL = `/post/share/count`
const putShareCountApi = params => {
  return httpRequest.putFetch(`${shareCountURL}`, params, {
    shouldUuid: true
  })
}

// post '/post/like/log'
const likeLogURL = `/post/like/log`
const postLikeLogApi = params => {
  return httpRequest.postFetch(`${likeLogURL}`, params, {
    shouldUuid: true
  })
}
// post '/post/like/log/list'
const likeLogListURL = `/post/like/log/list`
const postLikeLogListApi = params => {
  return httpRequest.postFetch(`${likeLogListURL}`, params, {
    shouldUuid: true
  })
}
export {
  getPostsApi,
  getArchiveApi,
  getArchiveFetchApi,
  getDetailApi,
  putViewCountApi,
  postLikeLogApi,
  postLikeLogListApi,
  putShareCountApi,
  getPostLanguageExistenceApi
}
