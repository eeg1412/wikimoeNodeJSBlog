// banner
import httpRequest from '~/api'

/**
 * @description 查询配置项
 * @return {any} 返回配置项
 */

const URL = `/movie/list`
const getMovieListApi = (params: any) => {
  return httpRequest.get(URL, params, { watch: false })
}
const getMovieListApiFetch = (params: any) => {
  return httpRequest.getFetch(URL, params)
}

export { getMovieListApi, getMovieListApiFetch }
