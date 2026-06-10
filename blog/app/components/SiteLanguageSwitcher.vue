<template>
  <div
    class="site-language-switcher inline-flex items-center justify-center align-middle gap-1"
    v-if="hasSiteLanguageSwitcher"
  >
    <WUIPopover :popper="{ arrow: true }" class="site-language-popover">
      <button
        class="site-language-trigger common-focus-visible-btn-outline hover:text-primary-400"
        :class="{
          'site-language-trigger-disabled': isLayoutLanguageSwitching
        }"
        :disabled="isLayoutLanguageSwitching"
        type="button"
        aria-label="Switch site language"
      >
        <WUIIcon
          name="i-heroicons-language"
          size="17"
          class="size-[1em] shrink-0"
        />
        <span>{{ currentLanguageLabel }}</span>
        <WUIIcon
          name="i-heroicons-chevron-down-20-solid"
          class="size-[1em] shrink-0"
        />
      </button>
      <template #panel="{ close }">
        <div class="site-language-panel p-2" @click.stop>
          <NuxtLink
            class="site-language-option flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-500 dark:text-gray-200 dark:hover:bg-gray-800"
            :class="{
              'site-language-option-disabled': isLayoutLanguageSwitching
            }"
            v-for="item in selectableSiteLanguageList"
            :key="item.code"
            :to="getSiteLanguagePath(item.code)"
            :aria-disabled="isLayoutLanguageSwitching"
            :tabindex="languageOptionTabindex"
            @click="handleSiteLanguageOptionClick($event, close)"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </template>
    </WUIPopover>
  </div>
</template>

<script setup>
import { LANGUAGE_CONFIG_LIST } from '#shared/languages'
import { resolveDefaultLanguageCode } from '@/utils/default-language'
import { useSiteLanguageAvailability } from '~/composables/useSiteLanguageAvailability'

const { options } = useOptions()
const { isLocalizedRoute, languageCode } = useLang()
const { siteLanguageEnabledMap } = useSiteLanguageAvailability()
const { isLayoutLanguageSwitching } = useLayoutLanguageSnapshot()

/**
 * 语言配置按 code 建立索引，用于快速显示当前语言名称。
 * @type {Record<string, { code: string, label: string, isDefault?: boolean }>}
 */
const languageConfigMap = {}
for (const item of LANGUAGE_CONFIG_LIST) {
  languageConfigMap[item.code] = item
}

/**
 * @description 介绍：读取主站源语言码；输入：当前 options。
 * @returns {import('vue').ComputedRef<string>} 输出：主站源语言码。
 */
const sourceLanguageCode = computed(() => {
  return resolveDefaultLanguageCode(options.value)
})

/**
 * @description 介绍：读取页脚当前应显示的语言码；输入：当前路由语言状态。
 * @returns {import('vue').ComputedRef<string>} 输出：当前站点语言码。
 */
const currentSiteLanguageCode = computed(() => {
  if (isLocalizedRoute.value) {
    return languageCode.value
  }

  return sourceLanguageCode.value
})

/**
 * @description 介绍：读取当前语言在选择器按钮中展示的名称；输入：当前语言码。
 * @returns {import('vue').ComputedRef<string>} 输出：当前语言名称。
 */
const currentLanguageLabel = computed(() => {
  const currentLanguageConfig = languageConfigMap[currentSiteLanguageCode.value]
  if (currentLanguageConfig) {
    return currentLanguageConfig.label
  }

  return ''
})

/**
 * @description 介绍：根据融合后的启用表筛选页脚可访问语言；输入：全局语言启用表。
 * @returns {import('vue').ComputedRef<Array<{ code: string, label: string, isDefault?: boolean }>>} 输出：可访问语言列表。
 */
const availableSiteLanguageList = computed(() => {
  const languageList = []
  for (const item of LANGUAGE_CONFIG_LIST) {
    if (siteLanguageEnabledMap.value?.[item.code] === true) {
      languageList.push(item)
    }
  }

  return languageList
})

/**
 * @description 介绍：筛选除当前语言外的可切换语言；输入：可访问语言列表和当前语言码。
 * @returns {import('vue').ComputedRef<Array<{ code: string, label: string, isDefault?: boolean }>>} 输出：下拉可选语言列表。
 */
const selectableSiteLanguageList = computed(() => {
  const languageList = []
  for (const item of availableSiteLanguageList.value) {
    if (item.code !== currentSiteLanguageCode.value) {
      languageList.push(item)
    }
  }

  return languageList
})

/**
 * @description 介绍：判断页脚是否需要展示站点语言选择器；输入：站点多语言开关和语言启用数量。
 * @returns {import('vue').ComputedRef<boolean>} 输出：true 表示展示选择器。
 */
const hasSiteLanguageSwitcher = computed(() => {
  if (options.value?.siteEnableMultilingual !== true) {
    return false
  }

  if (!currentLanguageLabel.value) {
    return false
  }

  return availableSiteLanguageList.value.length > 1
})

/**
 * @description 介绍：语言切换中禁用下拉选项键盘聚焦；输入：布局语言切换状态。
 * @returns {import('vue').ComputedRef<number>} 输出：选项 tabindex。
 */
const languageOptionTabindex = computed(() => {
  if (isLayoutLanguageSwitching.value) {
    return -1
  }

  return 0
})

/**
 * @description 介绍：生成站点语言首页路径；输入：目标语言码。
 * @param {string} targetLanguageCode 输入：目标语言码。
 * @returns {string} 输出：主站语言为根路径，多语言站为 /:code。
 */
const getSiteLanguagePath = targetLanguageCode => {
  if (targetLanguageCode === sourceLanguageCode.value) {
    return buildPlainPath('/')
  }

  return buildLanguagePath(targetLanguageCode, '/')
}

/**
 * @description 介绍：处理页脚语言选项点击；输入：点击事件和 Popover 关闭函数。
 * @param {MouseEvent} event 输入：点击事件。
 * @param {Function} close 输入：关闭 Popover 的函数。
 * @returns {void} 输出：无返回值。
 */
const handleSiteLanguageOptionClick = (event, close) => {
  if (isLayoutLanguageSwitching.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  close()
}
</script>

<style scoped>
.site-language-trigger {
  color: inherit;
  line-height: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  padding: 0;
}
.site-language-trigger,
.site-language-static {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.site-language-trigger-disabled,
.site-language-trigger:disabled,
.site-language-option-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.site-language-option-disabled {
  pointer-events: none;
}
.site-language-panel {
  min-width: 150px;
  max-height: 60svh;
  overflow: auto;
  scrollbar-width: thin;
}
</style>
