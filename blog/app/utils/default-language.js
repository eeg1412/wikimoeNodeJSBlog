import { computed } from 'vue'
import { useState } from '#app'
import {
  DEFAULT_LANGUAGE_CODE as CONFIG_DEFAULT_LANGUAGE_CODE,
  normalizeLanguageCode
} from '@/lang'

/**
 * @description 介绍：按站点配置解析默认语言；输入：options 配置对象。
 * @param {object|null} options 输入：站点 options。
 * @returns {string} 输出：可用的默认语言码。
 */
export function resolveDefaultLanguageCode(options) {
  const optionDefaultLanguageCode = normalizeLanguageCode(
    options?.siteDefaultLanguage
  )
  if (optionDefaultLanguageCode) {
    return optionDefaultLanguageCode
  }

  return CONFIG_DEFAULT_LANGUAGE_CODE
}

/**
 * @description 介绍：读取响应式站点默认语言；输入：无。
 * @returns {import('vue').ComputedRef<string>} 输出：默认语言 computed。
 */
export function useDefaultLanguageCode() {
  const options = useState('options', () => null)

  return computed(() => {
    return resolveDefaultLanguageCode(options.value)
  })
}
