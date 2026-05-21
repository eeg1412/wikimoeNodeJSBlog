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
 * @description 介绍：创建语言不存在时使用的 404 错误；输入：无。
 * @returns {Error} 输出：Nuxt createError 返回的 404 错误对象。
 */
function createLanguageNotFoundError() {
  return createError({ statusCode: 404, statusMessage: 'Language not found' })
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
    throw createLanguageNotFoundError()
  }

  const { getOptions } = useOptions()
  await getOptions({ languageCode, force: true })
}

export default defineNuxtRouteMiddleware(assertActiveLanguageRoute)
