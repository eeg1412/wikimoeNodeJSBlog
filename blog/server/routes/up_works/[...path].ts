export default defineEventHandler(async (event) => {
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  const path = getRouterParam(event, 'path') || ''
  const targetUrl = `${apiDomain}/up_works/${path}`
  
  return proxyRequest(event, targetUrl)
})
