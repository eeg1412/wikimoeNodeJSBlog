export default defineEventHandler(event => {
  const config = useRuntimeConfig()
  const apiDomain = config.apiDomain
  const originalUrl = event.node.req.url || ''
  const url = `${apiDomain}${originalUrl}`
  return proxyRequest(event, url)
})
