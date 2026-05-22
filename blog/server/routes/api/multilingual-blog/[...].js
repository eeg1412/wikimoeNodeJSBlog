import { buildMultilingualProxyUrl } from '../../../utils/languageSeo'

export default defineEventHandler(event => {
  const originalUrl = event.node.req.url || ''
  // 统一经过受校验的多语言上游地址，避免空配置时生成不可控代理目标。
  const url = buildMultilingualProxyUrl(event, originalUrl)
  return proxyRequest(event, url)
})
