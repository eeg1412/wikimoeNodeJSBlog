import { getMultilingualLanguageEnabledMapApi } from '@/api/language'
import { LANGUAGE_CONFIG_LIST } from '#shared/languages'
import { resolveDefaultLanguageCode } from '@/utils/default-language'

/**
 * 站点语言启用状态接口的最大等待时间，避免页脚增强信息拖慢首屏。
 * @type {number}
 */
const SITE_LANGUAGE_ENABLED_MAP_TIMEOUT = 1000

/**
 * @description 介绍：初始化站点语言启用状态缓存；输入：无。
 * @returns {Record<string, boolean>} 输出：空语言启用表。
 */
function createInitialSiteLanguageEnabledMap() {
  return {}
}

/**
 * @description 介绍：初始化远端语言启用状态是否已成功读取；输入：无。
 * @returns {boolean} 输出：false 表示尚未成功读取远端数据。
 */
function createInitialSiteLanguageEnabledMapLoaded() {
  return false
}

/**
 * @description 介绍：把接口或缓存数据规范化为本地支持语言的布尔表；输入：任意语言启用表。
 * @param {Record<string, any>} [data={}] 输入：待规范化的语言启用数据。
 * @returns {Record<string, boolean>} 输出：只包含本地支持语言的布尔表。
 */
function normalizeLanguageEnabledMap(data = {}) {
  const languageEnabledMap = {}
  if (!data || typeof data !== 'object') {
    return languageEnabledMap
  }

  for (const item of LANGUAGE_CONFIG_LIST) {
    languageEnabledMap[item.code] = data[item.code] === true
  }

  return languageEnabledMap
}

/**
 * @description 介绍：从 useFetch 响应中读取多语言站返回的语言启用表；输入：接口响应。
 * @param {any} response 输入：multilingualRequest.get 返回的 useFetch 响应对象。
 * @returns {Record<string, boolean>} 输出：接口 data 字段或空对象。
 */
function readLanguageEnabledMapResponse(response) {
  const responseData = response?.data?.value?.data
  if (responseData && typeof responseData === 'object') {
    return responseData
  }

  return {}
}

/**
 * @description 介绍：融合远端语言启用表和主站语言；输入：站点 options 与远端启用表。
 * @param {object|null} siteOptions 输入：当前站点 options。
 * @param {Record<string, boolean>} [remoteMap={}] 输入：远端语言启用表。
 * @returns {Record<string, boolean>} 输出：主站语言强制启用后的语言启用表。
 */
function buildMergedLanguageEnabledMap(siteOptions, remoteMap = {}) {
  const languageEnabledMap = normalizeLanguageEnabledMap(remoteMap)
  const sourceLanguageCode = resolveDefaultLanguageCode(siteOptions)
  if (sourceLanguageCode) {
    languageEnabledMap[sourceLanguageCode] = true
  }

  return languageEnabledMap
}

/**
 * @description 介绍：静默读取多语言站语言启用表；输入：无。
 * @returns {Promise<{ ok: boolean, data: Record<string, boolean> }>} 输出：读取结果，失败时 ok=false 且 data 为空。
 */
async function fetchRemoteLanguageEnabledMap() {
  try {
    const response = await getMultilingualLanguageEnabledMapApi(
      {},
      {
        shouldSkipErrorPage: true,
        timeout: SITE_LANGUAGE_ENABLED_MAP_TIMEOUT
      }
    )
    return {
      ok: true,
      data: readLanguageEnabledMapResponse(response)
    }
  } catch {
    return {
      ok: false,
      data: {}
    }
  }
}

/**
 * @description 介绍：提供站点多语言启用状态缓存、远端读取和主站语言融合能力；输入：无。
 * @returns {{ siteLanguageEnabledMap: import('vue').Ref<Record<string, boolean>>, refreshSiteLanguageAvailability: Function }} 输出：状态与刷新方法。
 */
export function useSiteLanguageAvailability() {
  const siteLanguageEnabledMap = useState(
    'siteLanguageEnabledMap',
    createInitialSiteLanguageEnabledMap
  )
  const siteLanguageEnabledMapLoaded = useState(
    'siteLanguageEnabledMapLoaded',
    createInitialSiteLanguageEnabledMapLoaded
  )

  /**
   * @description 介绍：提交语言启用表到全局状态，并同步到当前 options 方便其他逻辑复用；输入：options 与语言启用表。
   * @param {object|null} siteOptions 输入：当前站点 options。
   * @param {Record<string, boolean>} languageEnabledMap 输入：已融合的语言启用表。
   * @returns {Record<string, boolean>} 输出：写入后的全局语言启用表。
   */
  function commitLanguageEnabledMap(siteOptions, languageEnabledMap) {
    siteLanguageEnabledMap.value = languageEnabledMap
    if (siteOptions && typeof siteOptions === 'object') {
      siteOptions.siteLanguageEnabledMap = languageEnabledMap
    }

    return siteLanguageEnabledMap.value
  }

  /**
   * @description 介绍：按站点 options 刷新语言启用状态；输入：当前 options 和刷新参数。
   * @param {object|null} siteOptions 输入：当前站点 options。
   * @param {object} [params={}] 输入：刷新参数，force=true 时强制重新请求远端。
   * @returns {Promise<Record<string, boolean>>} 输出：融合后的语言启用表。
   */
  async function refreshSiteLanguageAvailability(siteOptions, params = {}) {
    if (!siteOptions || siteOptions.siteEnableMultilingual !== true) {
      const nextLanguageEnabledMap = buildMergedLanguageEnabledMap(
        siteOptions,
        {}
      )
      siteLanguageEnabledMapLoaded.value = false
      return commitLanguageEnabledMap(siteOptions, nextLanguageEnabledMap)
    }

    if (!params.force && siteLanguageEnabledMapLoaded.value) {
      const nextLanguageEnabledMap = buildMergedLanguageEnabledMap(
        siteOptions,
        siteLanguageEnabledMap.value
      )
      return commitLanguageEnabledMap(siteOptions, nextLanguageEnabledMap)
    }

    const remoteResult = await fetchRemoteLanguageEnabledMap()
    const nextLanguageEnabledMap = buildMergedLanguageEnabledMap(
      siteOptions,
      remoteResult.data
    )
    siteLanguageEnabledMapLoaded.value = remoteResult.ok
    return commitLanguageEnabledMap(siteOptions, nextLanguageEnabledMap)
  }

  return {
    siteLanguageEnabledMap,
    refreshSiteLanguageAvailability
  }
}
