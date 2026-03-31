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
const getCommentListApi = (params, options) => {
  return httpRequest.getFetch(commentListURL, params, {
    ...options,
    shouldUuid: true
  })
}
// /comment/create
const commentCreateURL = `/comment/create`
const getCommentCreateApi = (params, options) => {
  return httpRequest.postFetch(commentCreateURL, params, {
    ...options,
    shouldUuid: true,
    shouldCommentRetractJWT: true
  })
}

// post /comment/retract
const commentRetractURL = `/comment/retract`
const deleteCommentRetractApi = (params, options) => {
  return httpRequest.postFetch(`${commentRetractURL}`, params, {
    ...options,
    shouldUuid: true,
    shouldCommentRetractJWT: true
  })
}

// post /comment/like/log
const commentLikeLogURL = `/comment/like/log`
const postCommentLikeLogApi = params => {
  return httpRequest.postFetch(`${commentLikeLogURL}`, params, {
    shouldUuid: true
  })
}
// post /comment/like/log/list
const commentLikeLogListURL = `/comment/like/log/list`
const postCommentLikeLogListApi = params => {
  return httpRequest.postFetch(`${commentLikeLogListURL}`, params, {
    shouldUuid: true
  })
}
// post /comment/reaction
const commentReactionURL = `/comment/reaction`
const postCommentReactionApi = params => {
  return httpRequest.postFetch(`${commentReactionURL}`, params, {
    shouldUuid: true
  })
}
// post /comment/reaction/list
const commentReactionListURL = `/comment/reaction/list`
const postCommentReactionListApi = params => {
  return httpRequest.postFetch(`${commentReactionListURL}`, params, {
    shouldUuid: true
  })
}
export {
  getCommentLatestApi,
  getCommentListApi,
  getCommentCreateApi,
  deleteCommentRetractApi,
  postCommentLikeLogApi,
  postCommentLikeLogListApi,
  postCommentReactionApi,
  postCommentReactionListApi
}
