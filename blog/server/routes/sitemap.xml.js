export default defineEventHandler(event => {
  return proxyRequest(event, `http://localhost:3006/sitemap.xml`)
})
