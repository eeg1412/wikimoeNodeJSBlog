// This plugin initializes the SWR cache settings from the backend
// SWR settings are fetched dynamically and cached locally for performance
// Settings take effect immediately without requiring a restart

interface SwrCacheSettings {
  swrCacheEnabled: boolean
  swrCacheMaxAge: number
  swrCacheStaleMaxAge: number
  cacheMaxPage: number
  cacheTTL: number
}

interface CacheEntry {
  html: string
  timestamp: number
}

// Global state for SWR cache
const swrState = {
  settings: null as SwrCacheSettings | null,
  settingsTimestamp: 0,
  cacheVersion: 0,
  pageCache: new Map<string, CacheEntry>()
}

// Settings cache TTL (30 seconds)
const SETTINGS_CACHE_TTL = 30000

async function fetchSwrSettings(apiDomain: string): Promise<SwrCacheSettings> {
  const now = Date.now()
  
  // Return cached settings if still valid
  if (swrState.settings && (now - swrState.settingsTimestamp) < SETTINGS_CACHE_TTL) {
    return swrState.settings
  }
  
  try {
    const response = await $fetch<{ data: SwrCacheSettings }>(`${apiDomain}/api/blog/swr-cache-settings`)
    swrState.settings = response.data
    swrState.settingsTimestamp = now
    return swrState.settings
  } catch (error) {
    console.error('Failed to fetch SWR settings:', error)
  }
  
  // Return default settings if fetch fails
  return {
    swrCacheEnabled: false,
    swrCacheMaxAge: 10,
    swrCacheStaleMaxAge: 3600,
    cacheMaxPage: 10,
    cacheTTL: 60000
  }
}

async function checkCacheVersion(apiDomain: string): Promise<void> {
  try {
    const response = await $fetch<{ data: { cacheVersion: number } }>(`${apiDomain}/api/blog/cache-version`)
    const newVersion = response.data?.cacheVersion || 0
    
    // If version changed, clear the cache
    if (newVersion !== swrState.cacheVersion) {
      swrState.pageCache.clear()
      swrState.cacheVersion = newVersion
    }
  } catch (error) {
    // Silently ignore errors
  }
}

export default defineNitroPlugin((nitroApp) => {
  // Get the API domain from environment variables at runtime
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  
  // Hook into each request to handle SWR caching
  nitroApp.hooks.hook('request', async (event) => {
    // Make the API domain available in the event context
    event.context.apiDomain = apiDomain
    
    // Store SWR state reference
    event.context.swrState = swrState
    
    // Periodically check cache version
    await checkCacheVersion(apiDomain)
    
    // Fetch current SWR settings
    const settings = await fetchSwrSettings(apiDomain)
    event.context.swrSettings = settings
  })
  
  // Hook into render to implement SWR caching for pages
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const settings = event.context.swrSettings as SwrCacheSettings
    if (!settings?.swrCacheEnabled) {
      return
    }
    
    const url = getRequestURL(event)
    const pathname = url.pathname
    
    // Only cache specific page routes
    const shouldCache = pathname === '/' || 
                        pathname.startsWith('/page/') || 
                        pathname.startsWith('/post/')
    
    if (!shouldCache) {
      return
    }
    
    const cacheKey = pathname + url.search
    const now = Date.now()
    
    // Limit cache size
    if (swrState.pageCache.size >= settings.cacheMaxPage) {
      // Remove oldest entry
      let oldestKey = ''
      let oldestTime = Infinity
      for (const [key, entry] of swrState.pageCache) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp
          oldestKey = key
        }
      }
      if (oldestKey) {
        swrState.pageCache.delete(oldestKey)
      }
    }
    
    // Store in cache
    const htmlString = typeof html === 'string' ? html : JSON.stringify(html)
    swrState.pageCache.set(cacheKey, {
      html: htmlString,
      timestamp: now
    })
  })
  
  // Hook before render to check cache
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    const settings = event.context.swrSettings as SwrCacheSettings
    if (!settings?.swrCacheEnabled) {
      return
    }
    
    const url = getRequestURL(event)
    const pathname = url.pathname
    
    // Only cache specific page routes
    const shouldCache = pathname === '/' || 
                        pathname.startsWith('/page/') || 
                        pathname.startsWith('/post/')
    
    if (!shouldCache) {
      return
    }
    
    const cacheKey = pathname + url.search
    const cached = swrState.pageCache.get(cacheKey)
    
    if (cached) {
      const age = (Date.now() - cached.timestamp) / 1000
      const maxAge = settings.swrCacheMaxAge
      const staleMaxAge = settings.swrCacheStaleMaxAge
      
      // Add cache headers
      response.headers = response.headers || {}
      
      if (age < maxAge) {
        response.headers['X-SWR-Cache'] = 'HIT'
        response.headers['X-SWR-Age'] = Math.floor(age).toString()
        response.headers['Cache-Control'] = `public, max-age=${maxAge}, stale-while-revalidate=${staleMaxAge}`
      } else if (age < staleMaxAge) {
        response.headers['X-SWR-Cache'] = 'STALE'
        response.headers['X-SWR-Age'] = Math.floor(age).toString()
        response.headers['Cache-Control'] = `public, max-age=0, stale-while-revalidate=${staleMaxAge - age}`
      }
    } else {
      response.headers = response.headers || {}
      response.headers['X-SWR-Cache'] = 'MISS'
      response.headers['Cache-Control'] = `public, max-age=${settings.swrCacheMaxAge}, stale-while-revalidate=${settings.swrCacheStaleMaxAge}`
    }
  })
})
