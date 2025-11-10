import httpRequest from '~/api'

// post '/log/create'
const createURL = `/log/create`
const postLogCreateApi = params => {
  return httpRequest.postFetch(`${createURL}`, params, {
    shouldUuid: true
  })
}

// put /log/update/performance
const updatePerformanceURL = `/log/update/performance`
const putLogUpdatePerformanceApi = params => {
  return httpRequest.putFetch(`${updatePerformanceURL}`, params, {
    shouldUuid: true
  })
}

export { postLogCreateApi, putLogUpdatePerformanceApi }
