<template>
  <!-- 主题切换按钮 -->
  <div
    class="themeBtn common-right-tool-btn opacity-70 text-white"
    @click="switchFilterMenu"
  >
    <UIcon v-if="colorMode.preference === 'light'" name="i-heroicons-sun" />
    <UIcon
      v-else-if="colorMode.preference === 'dark'"
      name="i-heroicons-moon"
    />
    <UIcon v-else name="i-heroicons-computer-desktop" />
  </div>
  <transition name="fade">
    <div class="common-right-tool-menu-body" v-show="showFilterMenu">
      <div class="common-right-tool-menu-box">
        <div
          class="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-solid border-gray-200 dark:border-gray-700 text-base px-4 py-3"
        >
          <div>主题模式</div>
          <button
            class="text-gray-500 hover:text-gray-700"
            @click="switchFilterMenu"
          >
            <UIcon name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="custom-scroll common-right-tool-menu">
          <ul class="common-right-tool-menu-item-ul">
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                :class="{
                  active: colorMode.preference === 'light',
                }"
                @click="setColorMode('light')"
              >
                浅色模式
              </div>
            </li>
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                :class="{ active: colorMode.preference === 'dark' }"
                @click="setColorMode('dark')"
              >
                深色模式
              </div>
            </li>
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                :class="{ active: colorMode.preference === 'system' }"
                @click="setColorMode('system')"
              >
                跟随系统
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
// 使用Nuxt 3的colorMode组合式API
const colorMode = useColorMode()
const showFilterMenu = ref(false)

// 切换主题
const setColorMode = (mode) => {
  colorMode.preference = mode
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
watch(showFilterMenu, (val) => {
  if (!val) {
    clearRightMenuCloseFn('themeChanger')
  }
})
onUnmounted(() => {
  clearRightMenuCloseFn('themeChanger')
})
</script>

<style scoped></style>
