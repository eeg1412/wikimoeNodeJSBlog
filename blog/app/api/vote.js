// banner
import { resolveSiteRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

// get /vote/detail
const voteDetailURL = `/vote/detail`
const getVoteDetailApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch(`${voteDetailURL}`, siteRequest.params, {
    shouldUuid: true
  })
}

// post /vote
const voteURL = `/vote`
const postVoteApi = params => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.postFetch(`${voteURL}`, siteRequest.params, {
    shouldUuid: true
  })
}

export { getVoteDetailApi, postVoteApi }
