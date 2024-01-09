import httpRequest from '~/api'

// post '/log/create'
const createURL = `/log/create`
const postLogCreateApi = (params: any) => {
  return httpRequest.postFetch(`${createURL}`, params, {
    shouldUuid: true,
  })
}

export { postLogCreateApi }
