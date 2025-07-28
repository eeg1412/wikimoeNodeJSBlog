<template>
  <!-- 主题切换按钮 -->
  <div
    class="themeBtn common-right-tool-btn opacity-70 text-white"
    @click="switchFilterMenu"
  >
    <UIcon v-if="colorMode.value === 'light'" name="i-heroicons-sun" />
    <UIcon v-else-if="colorMode.value === 'dark'" name="i-heroicons-moon" />
  </div>
  <transition name="fade">
    <div class="common-right-tool-menu-body" v-show="showFilterMenu">
      <div class="common-right-tool-menu-box">
        <div
          class="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-solid border-gray-200 dark:border-gray-700 text-base px-4 py-3"
        >
          <div>主题设置</div>
          <button
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            @click="switchFilterMenu"
          >
            <UIcon name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="custom-scroll common-right-tool-menu">
          <div class="px-4 pt-3">
            <div
              class="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium"
            >
              显示模式
            </div>
            <div class="space-y-1">
              <div
                class="px-3 py-2 transition duration-300 hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded-md"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800':
                    colorMode.preference === 'system'
                }"
                @click="setColorMode('system')"
              >
                跟随系统
              </div>
              <div
                class="px-3 py-2 transition duration-300 hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded-md"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800':
                    colorMode.preference === 'light'
                }"
                @click="setColorMode('light')"
              >
                浅色模式
              </div>
              <div
                class="px-3 py-2 transition duration-300 hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded-md"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800':
                    colorMode.preference === 'dark'
                }"
                @click="setColorMode('dark')"
              >
                深色模式
              </div>
            </div>
          </div>

          <!-- 主题色选择 -->
          <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div
              class="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium"
            >
              主题色
            </div>
            <div class="grid grid-cols-6 gap-2">
              <div
                v-for="color in primaryColors"
                :key="color.value"
                class="flex items-center justify-center p-1 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="[
                  color.value === appConfig.ui.primary
                    ? 'bg-gray-50 dark:bg-gray-800'
                    : ''
                ]"
                @click="setPrimaryColor(color)"
                :title="color.text"
              >
                <div
                  class="w-6 h-6 rounded-full transition-all duration-200"
                  :class="[
                    color.value === appConfig.ui.primary
                      ? 'ring-2 ring-offset-2 ring-primary-400 ring-offset-white dark:ring-offset-gray-900 shadow-sm'
                      : 'hover:scale-110 hover:shadow-sm'
                  ]"
                  :style="{ backgroundColor: color.hex }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import colors from '#tailwind-config/theme/colors'

// 使用Nuxt 3的colorMode组合式API
const colorMode = useColorMode()
const appConfig = useAppConfig()
const showFilterMenu = ref(false)

// 主题色配置
const primaryColors = computed(() =>
  appConfig.ui.colors
    .filter(color => color !== 'primary')
    .map(color => ({
      value: color,
      text: color,
      hex: colors[color][colorMode.value === 'dark' ? 400 : 500]
    }))
)

// 切换主题
const setColorMode = mode => {
  colorMode.preference = mode
  showFilterMenu.value = false
}

// 设置主题色
const setPrimaryColor = color => {
  appConfig.ui.primary = color.value
  if (import.meta.client) {
    window.localStorage.setItem('nuxt-ui-primary', appConfig.ui.primary)
  }
  showFilterMenu.value = false
}

// 切换菜单显示状态
const switchFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
  if (showFilterMenu.value) {
    tryCloseRightMenu()
    setRightMenuCloseFn(() => {
      showFilterMenu.value = false
    }, 'themeChanger')
  }
}
// watch showFilterMenu
watch(showFilterMenu, val => {
  if (!val) {
    clearRightMenuCloseFn('themeChanger')
  }
})
onUnmounted(() => {
  clearRightMenuCloseFn('themeChanger')
})
</script>

<style scoped></style>
