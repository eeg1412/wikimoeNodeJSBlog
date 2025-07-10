// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/bangumi/list`
const getBangumiListApi = (params: any) => {
  return httpRequest.get(URL, params, { watch: false })
}
const getBangumiListApiFetch = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

// /bangumi/year/list
const URL2 = `/bangumi/year/list`
const getBangumiYearListApi = (params: any) => {
  return httpRequest.get(URL2, { watch: false })
}

// /bangumi/season/list
const URL3 = `/bangumi/season/list`
const getBangumiSeasonListApi = (params: any) => {
  return httpRequest.get(URL3, { watch: false })
}

export {
  getBangumiListApi,
  getBangumiListApiFetch,
  getBangumiYearListApi,
  getBangumiSeasonListApi
}
