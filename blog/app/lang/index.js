import {
  LANGUAGE_CONFIG_LIST,
  REQUIRED_LANGUAGE_MODULE_NAMES
} from '#shared/languages'

/**
 * @description 介绍：校验语言配置列表，保证默认语言和语言码定义完整且唯一。
 * @param {Array<object>} languageConfigList 输入：语言配置数组。
 * @returns {void} 输出：无；配置非法时抛出错误。
 */
function assertValidLanguageConfigList(languageConfigList) {
  if (!Array.isArray(languageConfigList) || languageConfigList.length === 0) {
    throw new Error('LANGUAGE_CONFIG_LIST must be a non-empty array')
  }

  const languageCodeSet = new Set()
  let defaultLanguageConfig = null

  for (const languageConfig of languageConfigList) {
    if (!languageConfig || typeof languageConfig !== 'object') {
      throw new Error('Language config must be an object')
    }

    if (
      typeof languageConfig.code !== 'string' ||
      !languageConfig.code.trim()
    ) {
      throw new Error('Language config code is required')
    }

    if (languageCodeSet.has(languageConfig.code)) {
      throw new Error(`Duplicate language code: ${languageConfig.code}`)
    }

    if (
      typeof languageConfig.label !== 'string' ||
      !languageConfig.label.trim()
    ) {
      throw new Error(`Language label is required: ${languageConfig.code}`)
    }

    languageCodeSet.add(languageConfig.code)

    if (languageConfig.isDefault) {
      if (defaultLanguageConfig) {
        throw new Error('Only one default language is allowed')
      }

      defaultLanguageConfig = languageConfig
    }
  }

  if (!defaultLanguageConfig) {
    throw new Error('Default language config is required')
  }
}

assertValidLanguageConfigList(LANGUAGE_CONFIG_LIST)

/**
 * @description 介绍：判断语言配置是否为默认语言配置。
 * @param {object} languageConfig 输入：单个语言配置对象。
 * @returns {boolean} 输出：true 表示默认语言。
 */
function isDefaultLanguageConfig(languageConfig) {
  return languageConfig.isDefault
}

/**
 * @description 介绍：读取语言配置中的标准语言码。
 * @param {object} languageConfig 输入：单个语言配置对象。
 * @returns {string} 输出：标准语言码字符串。
 */
function getLanguageConfigCode(languageConfig) {
  return languageConfig.code
}

/**
 * @description 介绍：把标准语言码写入大小写无关的索引表。
 * @param {Record<string, string>} map 输入：语言码索引表。
 * @param {string} code 输入：标准语言码。
 * @returns {Record<string, string>} 输出：写入后的语言码索引表。
 */
function addLanguageCodeMap(map, code) {
  map[code.toLowerCase()] = code
  return map
}

// 找出默认语言配置。
const DEFAULT_LANGUAGE_CONFIG = LANGUAGE_CONFIG_LIST.find(
  isDefaultLanguageConfig
)

// 生成受支持语言码列表。
export const SUPPORTED_LANGUAGE_CODES = LANGUAGE_CONFIG_LIST.map(
  getLanguageConfigCode
)
export const DEFAULT_LANGUAGE_CODE = DEFAULT_LANGUAGE_CONFIG.code

// 建立大小写无关的语言码映射。
export const LANGUAGE_CODE_MAP = SUPPORTED_LANGUAGE_CODES.reduce(
  addLanguageCodeMap,
  {}
)

const translationModules = import.meta.glob('./*/*.js', {
  eager: true,
  import: 'default'
})

/**
 * @description 介绍：扫描语言包模块并按语言码、模块名分组；输入：无。
 * @returns {Record<string, Record<string, object>>} 输出：按语言码和模块名分组的文案对象。
 */
function discoverLanguageTextMap() {
  const discoveredLanguageTextMap = {}

  for (const [modulePath, moduleText] of Object.entries(translationModules)) {
    const match = modulePath.match(/^\.\/([^/]+)\/([^/]+)\.js$/)
    if (!match) {
      throw new Error(`Invalid language file path: ${modulePath}`)
    }

    const languageCode = match[1]
    const moduleName = match[2]

    if (!discoveredLanguageTextMap[languageCode]) {
      discoveredLanguageTextMap[languageCode] = {}
    }

    discoveredLanguageTextMap[languageCode][moduleName] = moduleText
  }

  return discoveredLanguageTextMap
}

/**
 * @description 介绍：构建完整语言文案表，并校验语言目录和必需模块；输入：无。
 * @returns {Record<string, Record<string, object>>} 输出：完整语言文案表。
 */
function buildLanguageTextMap() {
  const discoveredLanguageTextMap = discoverLanguageTextMap()
  const languageTextMap = {}

  for (const languageCode of SUPPORTED_LANGUAGE_CODES) {
    const languageText = discoveredLanguageTextMap[languageCode]
    if (!languageText) {
      throw new Error(`Missing translation directory: ${languageCode}`)
    }

    for (const moduleName of REQUIRED_LANGUAGE_MODULE_NAMES) {
      if (!languageText[moduleName]) {
        throw new Error(
          `Missing translation file: ${languageCode}/${moduleName}.js`
        )
      }
    }

    languageTextMap[languageCode] = languageText
  }

  for (const languageCode of Object.keys(discoveredLanguageTextMap)) {
    if (!SUPPORTED_LANGUAGE_CODES.includes(languageCode)) {
      throw new Error(`Unexpected translation directory: ${languageCode}`)
    }
  }

  return languageTextMap
}

const LANGUAGE_TEXT_MAP = buildLanguageTextMap()

/**
 * @description 介绍：将输入语言码规范化为项目支持的标准语言码。
 * @param {unknown} input 输入：任意语言码输入。
 * @returns {string|null} 输出：标准语言码；无法识别时返回 null。
 */
export function normalizeLanguageCode(input) {
  if (typeof input !== 'string') {
    return null
  }

  const key = input.trim().toLowerCase()
  if (!key) {
    return null
  }

  return LANGUAGE_CODE_MAP[key] || null
}

/**
 * @description 介绍：断言输入语言码受支持，不支持时触发 404。
 * @param {unknown} input 输入：任意语言码输入。
 * @returns {string} 输出：标准语言码；不支持时抛出错误。
 */
export function assertLanguageCode(input) {
  const languageCode = normalizeLanguageCode(input)
  if (languageCode) {
    return languageCode
  }

  if (typeof showError === 'function') {
    showError({ statusCode: 404, statusMessage: 'Language code unsupported' })
  }

  throw new Error('LANGUAGE_CODE_UNSUPPORTED')
}

/**
 * @description 介绍：按点号路径从语言包对象中读取文案。
 * @param {object} source 输入：语言包对象。
 * @param {string} path 输入：点号分隔的文案路径。
 * @returns {unknown|undefined} 输出：读取到的值；路径不存在时返回 undefined。
 */
function readPath(source, path) {
  const keys = path.split('.')
  let value = source

  for (const key of keys) {
    if (!value || typeof value !== 'object' || !(key in value)) {
      return undefined
    }

    value = value[key]
  }

  return value
}

/**
 * @description 介绍：将文案模板中的占位符替换为实际参数。
 * @param {unknown} text 输入：文案模板。
 * @param {Record<string, unknown>} params 输入：插值参数。
 * @returns {unknown} 输出：插值后的文案；非字符串时返回原值。
 */
function interpolateText(text, params) {
  if (typeof text !== 'string' || !params || typeof params !== 'object') {
    return text
  }

  /**
   * @description 介绍：替换单个文案占位符。
   * @param {string} match 输入：完整占位符。
   * @param {string} key 输入：占位符名称。
   * @returns {string} 输出：占位符对应的参数值；不存在时返回原占位符。
   */
  function replacePlaceholder(match, key) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return String(params[key])
    }

    return match
  }

  return text.replace(/\{(\w+)\}/g, replacePlaceholder)
}

/**
 * @description 介绍：读取指定语言的文案，缺失时回退到默认语言。
 * @param {string} languageCode 输入：语言码。
 * @param {string} path 输入：文案路径。
 * @param {Record<string, unknown>} [params={}] 输入：插值参数。
 * @returns {string} 输出：文案字符串；当前语言和默认语言都缺失时返回 path。
 */
export function getLanguageText(languageCode, path, params = {}) {
  const canonicalCode =
    normalizeLanguageCode(languageCode) || DEFAULT_LANGUAGE_CODE
  const currentText = readPath(LANGUAGE_TEXT_MAP[canonicalCode], path)
  const fallbackText = readPath(LANGUAGE_TEXT_MAP[DEFAULT_LANGUAGE_CODE], path)
  const text = currentText === undefined ? fallbackText : currentText

  if (text === undefined) {
    return path
  }

  return interpolateText(text, params)
}

/**
 * @description 介绍：读取指定语言的完整文案对象。
 * @param {string} languageCode 输入：目标语言码。
 * @returns {Record<string, object>} 输出：目标语言的完整文案对象。
 */
export function getLanguageTextMap(languageCode) {
  const canonicalCode =
    normalizeLanguageCode(languageCode) || DEFAULT_LANGUAGE_CODE
  return LANGUAGE_TEXT_MAP[canonicalCode]
}
