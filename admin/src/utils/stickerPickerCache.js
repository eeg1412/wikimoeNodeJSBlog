let cachedStickerGroups = null
let cachePromise = null
const invalidateListeners = new Set()

export function getAdminStickerPickerCache() {
  return cachedStickerGroups
}

export function subscribeAdminStickerPickerCache(listener) {
  invalidateListeners.add(listener)

  return () => {
    invalidateListeners.delete(listener)
  }
}

export function invalidateAdminStickerPickerCache() {
  cachedStickerGroups = null
  cachePromise = null
  invalidateListeners.forEach(listener => {
    listener()
  })
}

export function requestAdminStickerPickerGroups(
  fetchStickerGroups,
  forceRefresh = false
) {
  const previousCache = cachedStickerGroups

  if (cachePromise) {
    return cachePromise
  }

  if (!forceRefresh && cachedStickerGroups) {
    return Promise.resolve(cachedStickerGroups)
  }

  cachePromise = fetchStickerGroups()
    .then(groups => {
      cachedStickerGroups = Array.isArray(groups) ? groups : []
      return cachedStickerGroups
    })
    .catch(() => {
      if (forceRefresh && previousCache) {
        cachedStickerGroups = previousCache
        return previousCache
      }

      return cachedStickerGroups || []
    })
    .finally(() => {
      cachePromise = null
    })

  return cachePromise
}
