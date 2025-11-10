// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/tag/detail`
const getTagDetailApi = params => {
  return httpRequest.get(URL, params)
}

// /tag/random/list
const RandomURL = `/tag/random/list`
const getRandomTagListApi = params => {
  return httpRequest.get(RandomURL, params)
}

export { getTagDetailApi, getRandomTagListApi }
