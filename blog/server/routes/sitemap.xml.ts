export default defineEventHandler(async (event) => {
  const apiDomain = process.env.NUXT_API_DOMAIN || 'http://localhost:3000'
  const targetUrl = `${apiDomain}/sitemap.xml`
  
  return proxyRequest(event, targetUrl)
})
