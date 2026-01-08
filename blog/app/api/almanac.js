// almanac API
import httpRequest from '~/api'

const URL = `/almanac`
const getAlmanacApi = params => {
  return httpRequest.get(URL, params, { watch: false })
}

export { getAlmanacApi }
