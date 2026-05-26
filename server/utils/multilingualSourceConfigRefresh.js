const log4js = require('log4js')

const adminApiLog = log4js.getLogger('adminApi')
const MULTILINGUAL_DOMAIN_ENV_NAME = 'MULTILINGUAL_DOMAIN'
const REFRESH_SOURCE_CONFIG_PATH =
  '/api/multilingual-admin/source/config/refresh-from-source'
const REQUEST_TIMEOUT = 5000

/**
 * 多语言站会缓存读取的源站配置项。
 * 保存其他后台配置时不需要通知多语言站刷新。
 * @type {string[]}
 */
const SOURCE_CONFIG_REFRESH_OPTION_NAMES = [
  'siteUrl',
  'siteTimeZone',
  'sitePageSize',
  'sitePostRandomSimilarCount',
  'sitePostRandomSimilarRange',
  'sitePostRandomSimilarShowRange',
  'siteReferrerWhiteList'
]

const SOURCE_CONFIG_REFRESH_OPTION_NAME_SET = new Set(
  SOURCE_CONFIG_REFRESH_OPTION_NAMES
)

/**
 * 将错误对象转换为日志可读文本。
 * @param {unknown} error - 待转换的错误对象
 * @returns {string} 错误文本
 */
function getErrorText(error) {
  if (global.logErrorToText) {
    return global.logErrorToText(error)
  }

  if (error && error.message) {
    return error.message
  }

  return String(error)
}

/**
 * 从保存成功的配置项列表中筛出会影响多语言站源站配置缓存的配置名。
 * @param {Array<{ name?: string }>} optionList - 源站已保存的配置项列表
 * @returns {string[]} 需要通知多语言站刷新的配置名列表
 */
function getAffectedOptionNames(optionList) {
  const optionNameSet = new Set()
  if (!Array.isArray(optionList)) {
    return []
  }

  optionList.forEach(item => {
    const name = String(item?.name || '').trim()
    if (SOURCE_CONFIG_REFRESH_OPTION_NAME_SET.has(name)) {
      optionNameSet.add(name)
    }
  })

  return Array.from(optionNameSet)
}

/**
 * 读取并校验多语言站域名配置。
 * 该域名用于源站在配置保存后通知多语言站刷新源站配置缓存。
 * @returns {string} 去除末尾斜杠后的多语言站域名
 * @throws {Error} MULTILINGUAL_DOMAIN 缺失、格式错误或协议非法时抛出
 */
function getMultilingualDomain() {
  const multilingualDomain = String(
    process.env[MULTILINGUAL_DOMAIN_ENV_NAME] || ''
  )
    .trim()
    .replace(/\/+$/, '')

  if (!multilingualDomain) {
    throw new Error('MULTILINGUAL_DOMAIN 未配置，无法自动刷新多语言站源站配置')
  }

  let parsedUrl = null
  try {
    parsedUrl = new URL(multilingualDomain)
  } catch (error) {
    throw new Error(
      'MULTILINGUAL_DOMAIN 配置无效，无法自动刷新多语言站源站配置'
    )
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(
      'MULTILINGUAL_DOMAIN 协议无效，无法自动刷新多语言站源站配置'
    )
  }

  return multilingualDomain
}

/**
 * 构建多语言站源站配置自动刷新接口 URL。
 * @returns {URL} 完整刷新接口 URL
 */
function buildRefreshUrl() {
  const multilingualDomain = getMultilingualDomain()
  const normalizedPathname = REFRESH_SOURCE_CONFIG_PATH.replace(/^\/+/, '')
  return new URL(`${multilingualDomain}/${normalizedPathname}`)
}

/**
 * 创建带清理方法的请求中止控制器。
 * @param {number} timeout - 超时时间，单位毫秒
 * @returns {{ signal: AbortSignal|undefined, cleanup: Function }} 请求中止控制器信息
 */
function createRequestAbortController(timeout) {
  if (typeof AbortController !== 'function') {
    return {
      signal: undefined,
      cleanup() {}
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, timeout)

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer)
    }
  }
}

/**
 * 从多语言站错误响应中提取可读错误信息。
 * @param {Response} response - fetch 响应对象
 * @param {string} responseText - 响应文本
 * @returns {string} 可写入日志的错误信息
 */
function getResponseErrorMessage(response, responseText) {
  let message = response.statusText || '未知错误'
  if (!responseText) {
    return message
  }

  try {
    const responseData = JSON.parse(responseText)
    const errorMessage =
      responseData?.errors?.[0]?.message || responseData?.message
    if (errorMessage) {
      message = errorMessage
    }
  } catch (error) {
    return message
  }

  return message
}

/**
 * 请求多语言站刷新源站配置缓存。
 * 源站只负责通知，多语言站会回源站校验这个 Authorization 是否仍然有效。
 * @param {string} authorization - 源站当前管理员的 Authorization 请求头
 * @returns {Promise<void>} 多语言站刷新成功时不返回数据
 * @throws {Error} fetch 不可用、请求失败、超时或多语言站返回错误时抛出
 */
async function requestMultilingualSourceConfigRefresh(authorization) {
  if (typeof fetch !== 'function') {
    throw new Error(
      '当前 Node.js 运行时不支持 fetch，无法自动刷新多语言站源站配置'
    )
  }

  const url = buildRefreshUrl()
  const abortController = createRequestAbortController(REQUEST_TIMEOUT)
  let response = null

  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: authorization
      },
      signal: abortController.signal
    })
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error('多语言站源站配置刷新接口请求超时')
    }

    throw error
  } finally {
    abortController.cleanup()
  }

  const responseText = await response.text()
  if (response.ok) {
    return
  }

  const message = getResponseErrorMessage(response, responseText)
  throw new Error(
    `多语言站源站配置刷新接口请求失败：${response.status} ${message}`
  )
}

/**
 * 在源站配置保存后通知多语言站刷新源站配置缓存。
 * 只有保存成功的配置项中包含多语言站依赖字段时才会发起请求。
 * @param {Object} params - 通知参数
 * @param {string} params.authorization - 源站当前管理员的 Authorization 请求头
 * @param {Array<{ name?: string }>} params.optionList - 源站已保存的配置项列表
 * @returns {Promise<{ skipped: boolean, affectedOptionNames: string[] }>} 通知结果
 */
async function notifyMultilingualSourceConfigRefresh(params = {}) {
  const affectedOptionNames = getAffectedOptionNames(params.optionList)
  if (affectedOptionNames.length === 0) {
    return {
      skipped: true,
      affectedOptionNames
    }
  }

  const authorization = String(params.authorization || '').trim()
  if (!authorization) {
    throw new Error(
      '缺少源站管理员 Authorization，无法自动刷新多语言站源站配置'
    )
  }

  await requestMultilingualSourceConfigRefresh(authorization)

  return {
    skipped: false,
    affectedOptionNames
  }
}

/**
 * 静默通知多语言站刷新源站配置缓存。
 * 自动刷新不能影响源站配置保存结果，失败只写入后台日志供排查。
 * @param {Object} params - 通知参数
 * @param {string} params.authorization - 源站当前管理员的 Authorization 请求头
 * @param {Array<{ name?: string }>} params.optionList - 源站已保存的配置项列表
 * @returns {Promise<void>} 日志处理完成后无返回值
 */
function notifyMultilingualSourceConfigRefreshSilently(params = {}) {
  return notifyMultilingualSourceConfigRefresh(params)
    .then(result => {
      if (result.skipped) {
        return
      }

      adminApiLog.info(
        `multilingual source config auto refresh success, optionNames=${result.affectedOptionNames.join(
          ','
        )}`
      )
    })
    .catch(error => {
      adminApiLog.error(
        `multilingual source config auto refresh fail, ${getErrorText(error)}`
      )
    })
}

module.exports = {
  notifyMultilingualSourceConfigRefreshSilently
}
