import httpRequest from '~/api'

// 获取系列详情（含各类型公开数量）
const URL_DETAIL = `/acgnseries/detail`
const getAcgnSeriesDetailApi = params => {
  return httpRequest.get(URL_DETAIL, params, { watch: false })
}
const getAcgnSeriesDetailApiFetch = params => {
  return httpRequest.getFetch(URL_DETAIL, params)
}

// 获取系列下的项目列表（按类型分页）
const URL_ITEMS = `/acgnseries/items`
const getAcgnSeriesItemsApi = params => {
  return httpRequest.get(URL_ITEMS, params, { watch: false })
}
const getAcgnSeriesItemsApiFetch = params => {
  return httpRequest.getFetch(URL_ITEMS, params)
}

export {
  getAcgnSeriesDetailApi,
  getAcgnSeriesDetailApiFetch,
  getAcgnSeriesItemsApi,
  getAcgnSeriesItemsApiFetch
}
