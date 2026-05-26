import {
  SUPPORTED_LANGUAGE_CODES,
  assertLanguageCode,
  getLanguageText,
  normalizeLanguageCode
} from '@/lang'
import { useDefaultLanguageCode } from '@/utils/default-language'

/**
 * @description 介绍：从 Nuxt 路由参数中读取原始语言码。
 * @param {object} route 输入：Nuxt 路由对象。
 * @returns {string|null} 输出：语言码字符串；不存在时返回 null。
 */
export function getRouteCode(route) {
  const code = route?.params?.code

  if (Array.isArray(code)) {
    return code[0]
  }

  if (typeof code === 'string') {
    return code
  }

  return null
}

/**
 * @description 介绍：判断路径是否指向允许透传的站外地址或特殊协议地址。
 * @param {string} path 输入：需要判断的路径。
 * @returns {boolean} 输出：true 表示外部路径或允许的特殊协议路径。
 */
function isExternalPath(path) {
  return /^(https?:)?\/\//i.test(path) || /^(mailto|tel):/i.test(path)
}

/**
 * @description 介绍：判断路径是否使用不允许写入 href 或 router 的脚本协议。
 * @param {string} path 输入：需要判断的路径。
 * @returns {boolean} 输出：true 表示路径协议不安全。
 */
function isUnsafeProtocolPath(path) {
  return /^(javascript|data|vbscript):/i.test(path.trim())
}

/**
 * @description 介绍：拆分路径主体和 query/hash 后缀，便于安全改写语言前缀。
 * @param {string} path 输入：待拆分的路径。
 * @returns {{ pathname: string, suffix: string }} 输出：包含 pathname 和 suffix 的对象。
 */
function splitPath(path) {
  const match = path.match(/^([^?#]*)([?#].*)?$/)

  return {
    pathname: match?.[1] || '/',
    suffix: match?.[2] || ''
  }
}

/**
 * @description 介绍：统一站内路径格式，保证后续语言前缀处理只面对绝对路径。
 * @param {string} path 输入：待规范化的站内路径。
 * @returns {{ normalizedPath: string, suffix: string }} 输出：包含 normalizedPath 和 suffix 的对象。
 */
function normalizeInternalPath(path) {
  const { pathname, suffix } = splitPath(path)
  let normalizedPath = pathname

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`
  }

  return {
    normalizedPath,
    suffix
  }
}

/**
 * @description 介绍：构造无语言前缀的旧站内路径。
 * @param {string} [path='/'] 输入：可能带语言前缀、query 或 hash 的路径。
 * @returns {string} 输出：无语言前缀的站内路径；外部路径原样返回。
 */
export function buildPlainPath(path = '/') {
  if (typeof path !== 'string' || !path) {
    return '/'
  }

  // 动态导航和横幅链接来自接口，禁止脚本协议穿过本地化路径工具。
  if (isUnsafeProtocolPath(path)) {
    return '/'
  }

  if (isExternalPath(path) || path.startsWith('#')) {
    return path
  }

  const { normalizedPath, suffix } = normalizeInternalPath(path)
  const pathList = normalizedPath.split('/')
  const existingCode = normalizeLanguageCode(pathList[1])

  if (existingCode) {
    pathList.splice(1, 1)
    const plainPath = pathList.join('/') || '/'
    return plainPath + suffix
  }

  return normalizedPath + suffix
}

/**
 * @description 介绍：构造带指定语言前缀的站内路径。
 * @param {string} languageCode 输入：目标语言码。
 * @param {string} [path='/'] 输入：站内路径。
 * @returns {string} 输出：带目标语言前缀的站内路径；外部路径原样返回。
 */
export function buildLanguagePath(languageCode, path = '/') {
  const targetLanguageCode = assertLanguageCode(languageCode)

  if (typeof path !== 'string' || !path) {
    return `/${targetLanguageCode}`
  }

  // 动态导航和横幅链接来自接口，禁止脚本协议穿过本地化路径工具。
  if (isUnsafeProtocolPath(path)) {
    return `/${targetLanguageCode}`
  }

  if (isExternalPath(path) || path.startsWith('#')) {
    return path
  }

  const { normalizedPath, suffix } = normalizeInternalPath(path)
  const pathList = normalizedPath.split('/')
  const existingCode = normalizeLanguageCode(pathList[1])

  if (existingCode) {
    pathList[1] = targetLanguageCode
    return pathList.join('/') + suffix
  }

  if (normalizedPath === '/') {
    return `/${targetLanguageCode}${suffix}`
  }

  return `/${targetLanguageCode}${normalizedPath}${suffix}`
}

/**
 * @description 介绍：根据当前路由模式构造站内路径。
 * @param {string} languageCode 输入：当前语言码。
 * @param {string} [path='/'] 输入：站内路径。
 * @param {boolean} [isLocalizedRoute=false] 输入：是否为带 code 路由。
 * @returns {string} 输出：匹配当前路由模式的站内路径。
 */
export function buildLocalePath(
  languageCode,
  path = '/',
  isLocalizedRoute = false
) {
  if (isLocalizedRoute) {
    return buildLanguagePath(languageCode, path)
  }

  return buildPlainPath(path)
}

/**
 * @description 介绍：构造 SEO 资源路径；无 code 源站使用源站路径，带 code 路由保留语言前缀。
 * @param {string} languageCode 输入：当前语言码。
 * @param {string} [path='/'] 输入：站内资源路径。
 * @param {boolean} [isLocalizedRoute=false] 输入：是否为带 code 路由。
 * @returns {string} 输出：可访问的 SEO 资源路径。
 */
export function buildSeoResourcePath(
  languageCode,
  path = '/',
  isLocalizedRoute = false
) {
  if (isLocalizedRoute) {
    return buildLanguagePath(languageCode, path)
  }

  return buildPlainPath(path)
}

function createInitialLanguageDisplayState() {
  return {
    isLocked: false,
    languageCode: '',
    isLocalizedRoute: false
  }
}

export function useLanguageDisplayState() {
  const languageDisplayState = useState(
    'languageDisplayState',
    createInitialLanguageDisplayState
  )

  function lockLanguageDisplay(languageContext) {
    languageDisplayState.value = {
      isLocked: true,
      languageCode: assertLanguageCode(languageContext.languageCode),
      isLocalizedRoute: Boolean(languageContext.isLocalizedRoute)
    }
  }

  function unlockLanguageDisplay() {
    languageDisplayState.value = createInitialLanguageDisplayState()
  }

  return {
    languageDisplayState,
    lockLanguageDisplay,
    unlockLanguageDisplay
  }
}

/**
 * @description 介绍：提供当前语言、双模式路由状态和本地化路径工具；输入：无。
 * @returns {object} 输出：包含 isLocalizedRoute、languageCode、localePath、localeUrl 和 t 的对象。
 */
export function useLang() {
  const route = useRoute()
  const defaultLanguageCode = useDefaultLanguageCode()
  const { languageDisplayState } = useLanguageDisplayState()
  /**
   * @description 介绍：读取当前路由参数里的语言码原始值；输入：无。
   * @returns {import('vue').ComputedRef<string|null>} 输出：值为语言码字符串或 null 的 computed。
   */
  const routeCode = computed(() => getRouteCode(route))
  /**
   * @description 介绍：判断当前 URL 是否显式处于多语言路由模式；输入：无。
   * @returns {import('vue').ComputedRef<boolean>} 输出：值为布尔值的 computed。
   */
  const routeIsLocalizedRoute = computed(() => {
    return Boolean(routeCode.value)
  })
  const isLocalizedRoute = computed(() => {
    if (languageDisplayState.value.isLocked) {
      return languageDisplayState.value.isLocalizedRoute
    }

    return routeIsLocalizedRoute.value
  })
  /**
   * @description 介绍：计算当前显示语言；无 code 时使用默认语言，带 code 时严格校验 URL 语言码；输入：无。
   * @returns {import('vue').ComputedRef<string>} 输出：值为标准语言码的 computed。
   */
  const languageCode = computed(() => {
    if (languageDisplayState.value.isLocked) {
      return languageDisplayState.value.languageCode
    }

    if (!routeIsLocalizedRoute.value) {
      return defaultLanguageCode.value
    }

    return assertLanguageCode(routeCode.value)
  })
  languageCode.value

  /**
   * @description 介绍：读取当前语言下的文案。
   * @param {string} path 输入：文案路径。
   * @param {Record<string, unknown>} [params={}] 输入：文案插值参数。
   * @returns {string} 输出：当前语言下的文案字符串。
   */
  const t = (path, params = {}) => {
    return getLanguageText(languageCode.value, path, params)
  }

  /**
   * @description 介绍：按当前路由模式生成站内路径。
   * @param {string} path 输入：待生成的站内路径。
   * @returns {string} 输出：旧路由路径或带语言前缀的本地化路径。
   */
  const localePath = path => {
    return buildLocalePath(languageCode.value, path, isLocalizedRoute.value)
  }

  /**
   * @description 介绍：按当前路由模式生成完整站点 URL。
   * @param {string} siteUrl 输入：站点根 URL。
   * @param {string} path 输入：站内路径。
   * @returns {string} 输出：完整 URL 字符串。
   */
  const localeUrl = (siteUrl, path) => {
    return `${siteUrl || ''}${localePath(path)}`
  }

  /**
   * @description 介绍：构造 SEO 资源完整 URL；带 code 路由使用多语言 RSS/站点地图入口。
   * @param {string} siteUrl 输入：站点根 URL。
   * @param {string} path 输入：站内资源路径。
   * @returns {string} 输出：完整 URL 字符串。
   */
  const seoResourceUrl = (siteUrl, path) => {
    const resourcePath = buildSeoResourcePath(
      languageCode.value,
      path,
      isLocalizedRoute.value
    )
    return `${siteUrl || ''}${resourcePath}`
  }

  return {
    isLocalizedRoute,
    languageCode,
    defaultLanguageCode,
    supportedLanguageCodes: SUPPORTED_LANGUAGE_CODES,
    normalizeLanguageCode,
    localePath,
    localeUrl,
    seoResourceUrl,
    t
  }
}
