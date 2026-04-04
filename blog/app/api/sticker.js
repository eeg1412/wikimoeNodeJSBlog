import httpRequest from '~/api'

// /sticker/groups
const stickerGroupsURL = `/sticker/groups`

// 模块级缓存
let cachedGroups = null
let cachePromise = null

const getStickerGroupsApi = () => {
  if (cachedGroups) {
    return Promise.resolve(cachedGroups)
  }
  if (cachePromise) {
    return cachePromise
  }
  cachePromise = httpRequest
    .getFetch(stickerGroupsURL, {}, {})
    .then(res => {
      cachedGroups = res.list || []
      return cachedGroups
    })
    .catch(err => {
      cachePromise = null
      throw err
    })
  return cachePromise
}

export { getStickerGroupsApi }
