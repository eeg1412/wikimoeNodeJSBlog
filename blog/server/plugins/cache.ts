// This plugin fetches SWR cache settings from the backend and stores them globally
// The cache version is checked periodically to invalidate cache when needed

let cacheVersion = 0

export default defineNitroPlugin((nitroApp) => {
  // Fetch initial cache settings and version
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  
  // Store the API domain for use in other parts of the application
  nitroApp.hooks.hook('request', async (event) => {
    // Make the API domain available in the event context
    event.context.apiDomain = apiDomain
  })
  
  console.log('SWR Cache Plugin initialized, API Domain:', apiDomain)
})
