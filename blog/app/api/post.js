import httpRequest from '~/api'

/**
 * @description 查询文章
 * @return {any} 返回文章
 */
const URL = `/post/list`
const getPostsApi = params => {
  return httpRequest.get(URL, params)
}

// '/post/archive'
const archiveURL = `/post/archive`
const getArchiveApi = () => {
  return httpRequest.get(archiveURL)
}
// '/post/detail'
const detailURL = `/post/detail`
const getDetailApi = params => {
  return httpRequest.get(`${detailURL}`, params)
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
// post '/post/reaction'
const postReactionURL = `/post/reaction`
const postReactionApi = params => {
  return httpRequest.postFetch(`${postReactionURL}`, params, {
    shouldUuid: true
  })
}
// post '/post/reaction/list'
const postReactionListURL = `/post/reaction/list`
const postReactionListApi = params => {
  return httpRequest.postFetch(`${postReactionListURL}`, params, {
    shouldUuid: true
  })
}
// get '/reaction/emojis'
const reactionEmojisURL = `/reaction/emojis`
const getReactionEmojisApi = () => {
  return httpRequest.getFetch(`${reactionEmojisURL}`)
}
// get '/post/list' (client-side fetch)
const getPostsApiFetch = params => {
  return httpRequest.getFetch(URL, params)
}
// get '/post/detail' (client-side fetch)
const getDetailApiFetch = params => {
  return httpRequest.getFetch(`${detailURL}`, params)
}
export {
  getPostsApi,
  getArchiveApi,
  getDetailApi,
  putViewCountApi,
  postLikeLogApi,
  postLikeLogListApi,
  putShareCountApi,
  postReactionApi,
  postReactionListApi,
  getReactionEmojisApi,
  getPostsApiFetch,
  getDetailApiFetch
}
