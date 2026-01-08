// almanac API
import httpRequest from '~/api'

const URL = `/almanac`
const getAlmanacApi = params => {
  return httpRequest.get(URL, params, { watch: false })
}
const getAlmanacApiFetch = params => {
  return httpRequest.getFetch(URL, params)
}

export { getAlmanacApi, getAlmanacApiFetch }
