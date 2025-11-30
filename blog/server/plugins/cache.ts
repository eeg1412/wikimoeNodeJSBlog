// This plugin initializes the SWR cache settings from the backend
// The API domain is made available to all server routes at runtime

export default defineNitroPlugin((nitroApp) => {
  // Get the API domain from environment variables at runtime
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  
  // Store the API domain for use in other parts of the application
  nitroApp.hooks.hook('request', async (event) => {
    // Make the API domain available in the event context
    event.context.apiDomain = apiDomain
  })
})
