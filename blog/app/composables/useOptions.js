import { getMultilingualOptionsApi, getOptionsApi } from '~/api/option'
import { DEFAULT_LANGUAGE_CODE, normalizeLanguageCode } from '@/lang'
import { getRouteCode } from '~/composables/useLang'

const BLOG_LANGUAGE_DISABLED_REASON = 'BLOG_LANGUAGE_DISABLED'

/**
 * @description 介绍：读取当前路由中的语言码原始参数；输入：无。
 * @returns {string|null} 输出：语言码字符串；不存在时返回 null。
 */
function getCurrentRouteCode() {
  const route = useRoute()
  return getRouteCode(route)
}

/**
 * @description 介绍：创建语言不可用时抛出的 404 错误。
 * @param {string} [reason='LANGUAGE_NOT_FOUND'] 输入：错误原因标识。
 * @returns {Error} 输出：Nuxt createError 返回的错误对象。
 */
function createLanguageNotFoundError(reason = 'LANGUAGE_NOT_FOUND') {
  let statusMessage = 'Language not found'
  if (reason === BLOG_LANGUAGE_DISABLED_REASON) {
    statusMessage = 'Blog language disabled'
  }

  return createError({
    statusCode: 404,
    statusMessage,
    data: {
      reason
    }
  })
}

/**
 * @description 介绍：判断调用方是否显式传入了语言码参数。
 * @param {object} [params={}] 输入：请求参数对象。
 * @returns {boolean} 输出：true 表示调用方显式传入了 languageCode。
 */
function hasLanguageCodeParam(params = {}) {
  if (!Object.prototype.hasOwnProperty.call(params, 'languageCode')) {
    return false
  }

  if (params.languageCode === null || params.languageCode === '') {
    return false
  }

  return params.languageCode !== undefined
}

/**
 * @description 介绍：判定当前 options 请求应该按源站模式还是多语言模式执行。
 * @param {object} [params={}] 输入：请求参数对象。
 * @returns {{ isLocalizedRoute: boolean, languageCode: string }} 输出：语言上下文对象。
 */
function getOptionsLanguageContext(params = {}) {
  if (hasLanguageCodeParam(params)) {
    const paramsLanguageCode = normalizeLanguageCode(params.languageCode)
    if (!paramsLanguageCode) {
      throw createLanguageNotFoundError()
    }

    return {
      isLocalizedRoute: true,
      languageCode: paramsLanguageCode
    }
  }

  const routeCode = getCurrentRouteCode()
  if (!routeCode) {
    return {
      isLocalizedRoute: false,
      languageCode: DEFAULT_LANGUAGE_CODE
    }
  }

  const routeLanguageCode = normalizeLanguageCode(routeCode)
  if (routeLanguageCode) {
    return {
      isLocalizedRoute: true,
      languageCode: routeLanguageCode
    }
  }

  throw createLanguageNotFoundError()
}

/**
 * @description 介绍：从源站 useFetch 返回结构中读取 options 数据。
 * @param {any} response 输入：源站 options API 的 useFetch 响应。
 * @returns {object} 输出：源站 options 对象。
 */
function readSourceOptions(response) {
  const sourceOptions = response?.data?.value?.data
  if (!sourceOptions || typeof sourceOptions !== 'object') {
    throw new Error('Invalid source options response')
  }

  return sourceOptions
}

/**
 * @description 介绍：从多语言 $fetch 返回结构中读取 options 数据。
 * @param {any} response 输入：多语言 options API 的 $fetch 响应。
 * @returns {object} 输出：多语言 options 对象。
 */
function readMultilingualOptions(response) {
  const multilingualOptions = response?.data
  if (!multilingualOptions || typeof multilingualOptions !== 'object') {
    throw new Error('Invalid multilingual options response')
  }

  return multilingualOptions
}

/**
 * @description 介绍：校验当前语言的 blog 是否已经启用。
 * @param {object} multilingualOptions 输入：多语言配置对象。
 * @returns {void} 输出：无返回值。
 */
function assertBlogLanguageEnabled(multilingualOptions) {
  if (multilingualOptions.blogLanguageEnabled === true) {
    return
  }

  throw createLanguageNotFoundError(BLOG_LANGUAGE_DISABLED_REASON)
}

/**
 * @description 介绍：合并源站 options 和当前语言的多语言 options。
 * @param {object} sourceOptions 输入：源站配置。
 * @param {object} multilingualOptions 输入：多语言配置。
 * @returns {object} 输出：合并后的 options 对象。
 */
function mergeOptions(sourceOptions, multilingualOptions) {
  return {
    ...sourceOptions,
    ...multilingualOptions
  }
}

/**
 * @description 介绍：初始化 options 缓存为空；输入：无。
 * @returns {null} 输出：空 options 缓存值。
 */
function createInitialOptions() {
  return null
}

/**
 * @description 介绍：初始化 options 缓存所属语言码为空；输入：无。
 * @returns {string} 输出：空字符串。
 */
function createInitialOptionsLanguageCode() {
  return ''
}

/**
 * @description 介绍：初始化 options 缓存模式为无语言码旧路由；输入：无。
 * @returns {boolean} 输出：false。
 */
function createInitialOptionsIsLocalizedRoute() {
  return false
}

/**
 * @description 介绍：提供双模式 options 读取和缓存状态；输入：无。
 * @returns {object} 输出：包含 options 状态和 getOptions 方法的对象。
 */
export function useOptions() {
  const options = useState('options', createInitialOptions)
  const optionsLanguageCode = useState(
    'optionsLanguageCode',
    createInitialOptionsLanguageCode
  )
  const optionsIsLocalizedRoute = useState(
    'optionsIsLocalizedRoute',
    createInitialOptionsIsLocalizedRoute
  )

  /**
   * @description 介绍：判断当前已缓存的 options 是否能复用。
   * @param {object} params 输入：请求参数。
   * @param {{ isLocalizedRoute: boolean, languageCode: string }} languageContext 输入：当前语言上下文。
   * @returns {boolean} 输出：true 表示可以复用缓存。
   */
  function shouldReuseOptions(params, languageContext) {
    if (params.force) {
      return false
    }

    if (!options.value) {
      return false
    }

    if (optionsLanguageCode.value !== languageContext.languageCode) {
      return false
    }

    return optionsIsLocalizedRoute.value === languageContext.isLocalizedRoute
  }

  /**
   * @description 介绍：写入 options 缓存并同步记录缓存所属语言模式。
   * @param {object} data 输入：options 数据。
   * @param {{ isLocalizedRoute: boolean, languageCode: string }} languageContext 输入：当前语言上下文。
   * @returns {object} 输出：写入后的 options 数据。
   */
  function setOptions(data, languageContext) {
    options.value = data
    optionsLanguageCode.value = languageContext.languageCode
    optionsIsLocalizedRoute.value = languageContext.isLocalizedRoute
    return options.value
  }

  /**
   * @description 介绍：读取无 code 旧路由使用的源站 options。
   * @param {{ isLocalizedRoute: boolean, languageCode: string }} languageContext 输入：当前语言上下文。
   * @returns {Promise<object>} 输出：写入缓存后的源站 options。
   */
  async function getSourceOptions(languageContext) {
    const sourceResponse = await getOptionsApi()
    const sourceOptions = readSourceOptions(sourceResponse)
    return setOptions(sourceOptions, languageContext)
  }

  /**
   * @description 介绍：读取带 code 多语言路由使用的合并 options。
   * @param {{ isLocalizedRoute: boolean, languageCode: string }} languageContext 输入：当前语言上下文。
   * @returns {Promise<object>} 输出：写入缓存后的合并 options。
   */
  async function getLocalizedOptions(languageContext) {
    const [sourceResponse, multilingualResponse] = await Promise.all([
      getOptionsApi(),
      getMultilingualOptionsApi(
        {},
        {
          languageCode: languageContext.languageCode
        }
      )
    ])
    const sourceOptions = readSourceOptions(sourceResponse)
    const multilingualOptions = readMultilingualOptions(multilingualResponse)
    assertBlogLanguageEnabled(multilingualOptions)
    return setOptions(
      mergeOptions(sourceOptions, multilingualOptions),
      languageContext
    )
  }

  /**
   * @description 介绍：按当前路由模式读取 options。
   * @param {object} [params={}] 输入：请求参数，可包含 languageCode 和 force。
   * @returns {Promise<object>} 输出：当前模式可用的 options。
   */
  async function getOptions(params = {}) {
    const languageContext = getOptionsLanguageContext(params)

    if (shouldReuseOptions(params, languageContext)) {
      return options.value
    }

    if (languageContext.isLocalizedRoute) {
      return getLocalizedOptions(languageContext)
    }

    return getSourceOptions(languageContext)
  }

  return {
    options,
    optionsLanguageCode,
    optionsIsLocalizedRoute,
    getOptions
  }
}
