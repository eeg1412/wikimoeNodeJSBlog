import httpRequest from '~/api'

// post '/log/create'
const createURL = `/log/create`
const postLogCreateApi = (params: any) => {
  return httpRequest.postFetch(`${createURL}`, params, {
    shouldUuid: true
  })
}

// put /log/update/performance
const updatePerformanceURL = `/log/update/performance`
const putLogUpdatePerformanceApi = (params: any) => {
  return httpRequest.putFetch(`${updatePerformanceURL}`, params, {
    shouldUuid: true
  })
}

export { postLogCreateApi, putLogUpdatePerformanceApi }
