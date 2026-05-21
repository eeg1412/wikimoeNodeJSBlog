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
  const config = useRuntimeConfig(event)
  const apiDomain = config.apiMultilingualDomain
  const languageCode = getCanonicalLanguageCode(event)
  const url = `${apiDomain}${getCanonicalRequestUrl(event, languageCode)}`
  return proxyRequest(event, url)
}
