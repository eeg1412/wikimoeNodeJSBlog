// banner
import httpRequest, { multilingualRequest } from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

// get /vote/detail
const voteDetailURL = `/vote/detail`
const getVoteDetailApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.getFetch(`${voteDetailURL}`, params, {
      shouldUuid: true
    })
  }
  return httpRequest.getFetch(`${voteDetailURL}`, params, {
    shouldUuid: true
  })
}

// post /vote
const voteURL = `/vote`
const postVoteApi = params => {
  const languageCode = params?.languageCode
  if (languageCode) {
    return multilingualRequest.postFetch(`${voteURL}`, params, {
      shouldUuid: true
    })
  }
  return httpRequest.postFetch(`${voteURL}`, params, {
    shouldUuid: true
  })
}

export { getVoteDetailApi, postVoteApi }
