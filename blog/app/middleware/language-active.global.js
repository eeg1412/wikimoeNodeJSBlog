import { normalizeLanguageCode } from '@/lang'
import { getRouteCode } from '~/composables/useLang'

/**
 * @description 介绍：从路由参数中解析并规范化语言码。
 * @param {object} route 输入：Nuxt 路由对象。
 * @returns {string|null} 输出：标准语言码；无 code 或不支持时返回 null。
 */
function getRouteLanguageCode(route) {
  const routeCode = getRouteCode(route)

  if (!routeCode) {
    return null
  }

  return normalizeLanguageCode(routeCode)
}

/**
 * @description 介绍：只在显式带 code 的路由上校验语言启用状态，无 code 的旧路由直接放行。
 * @param {object} to 输入：即将进入的 Nuxt 路由对象。
 * @returns {Promise<void>} 输出：校验通过时无返回值，不通过时抛出 404。
 */
async function assertActiveLanguageRoute(to) {
  const routeCode = getRouteCode(to)
  if (!routeCode) {
    return
  }

  const languageCode = getRouteLanguageCode(to)

  if (!languageCode) {
    const { createLanguageNotFoundError } = useOptions()
    throw createLanguageNotFoundError()
  }

  // 客户端语言切换由 app.vue 的 router.beforeEach 统一预取并处理失败 toast。
  // 这里不重复请求，避免接口 502 先进入 Nuxt error 流程，绕过切换失败提示。
  if (import.meta.client) {
    return
  }

  // 首屏进入带 code 的页面前先读取该语言配置，避免已停用语言继续渲染或命中缓存。
  const { prepareOptions } = useOptions()
  await prepareOptions({ languageCode })
}

export default defineNuxtRouteMiddleware(assertActiveLanguageRoute)
