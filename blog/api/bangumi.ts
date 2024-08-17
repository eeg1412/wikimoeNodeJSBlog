// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/bangumi/list`
const getBangumiListApi = (params: any) => {
  return httpRequest.get(URL, params)
}

// /bangumi/year/list
const URL2 = `/bangumi/year/list`
const getBangumiYearListApi = (params: any) => {
  return httpRequest.get(URL2)
}

export { getBangumiListApi, getBangumiYearListApi }
