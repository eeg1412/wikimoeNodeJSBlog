export default defineEventHandler(async (event) => {
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  const path = getRouterParam(event, 'path') || ''
  const targetUrl = `${apiDomain}/content/${path}`
  
  return proxyRequest(event, targetUrl)
})
