import { LANGUAGE_CONFIG_LIST } from '#shared/languages'

const SUPPORTED_LANGUAGE_CODES = LANGUAGE_CONFIG_LIST.map(languageConfig => {
  return languageConfig.code
})

const LANGUAGE_CODE_MAP = SUPPORTED_LANGUAGE_CODES.reduce((map, code) => {
  map[code.toLowerCase()] = code
  return map
}, {})

function normalizeLanguageCode(input) {
  if (typeof input !== 'string') {
    return null
  }

  const key = input.trim().toLowerCase()
  if (!key) {
    return null
  }

  return LANGUAGE_CODE_MAP[key] || null
}

export function getMultilingualApiDomain(event) {
  const config = useRuntimeConfig(event)
  const apiDomain = String(config.apiMultilingualDomain || '').trim()

  // 多语言代理只接受显式 http(s) 上游，避免空配置或异常协议进入 proxyRequest。
  if (!apiDomain) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Multilingual API domain is not configured'
    })
  }

  let parsedUrl = null
  try {
    parsedUrl = new URL(apiDomain)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Multilingual API domain is invalid'
    })
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Multilingual API domain protocol is invalid'
    })
  }

  return apiDomain.replace(/\/+$/, '')
}

export function buildMultilingualProxyUrl(event, requestUrl) {
  const apiDomain = getMultilingualApiDomain(event)
  let normalizedRequestUrl = requestUrl || '/'

  if (!normalizedRequestUrl.startsWith('/')) {
    normalizedRequestUrl = `/${normalizedRequestUrl}`
  }

  return `${apiDomain}${normalizedRequestUrl}`
}

export function getCanonicalLanguageCode(event) {
  const languageCode = normalizeLanguageCode(getRouterParam(event, 'code'))
  if (!languageCode) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return languageCode
}

export function getCanonicalRequestUrl(event, languageCode) {
  const originalUrl = event.node.req.originalUrl || event.node.req.url || ''
  const urlParts = originalUrl.split('/')
  urlParts[1] = languageCode
  return urlParts.join('/')
}

export function proxyLanguageSeoRequest(event) {
  const languageCode = getCanonicalLanguageCode(event)
  const url = buildMultilingualProxyUrl(
    event,
    getCanonicalRequestUrl(event, languageCode)
  )
  return proxyRequest(event, url)
}
