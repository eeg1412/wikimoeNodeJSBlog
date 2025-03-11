// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

// get /vote/detail
const voteDetailURL = `/vote/detail`
const getVoteDetailApi = (params: any) => {
  return httpRequest.getFetch(`${voteDetailURL}`, params, {
    shouldUuid: true,
  })
}

// post /vote
const voteURL = `/vote`
const postVoteApi = (params: any) => {
  return httpRequest.postFetch(`${voteURL}`, params, {
    shouldUuid: true,
  })
}

export { getVoteDetailApi, postVoteApi }
