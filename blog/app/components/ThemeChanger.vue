<template>
  <!-- 主题切换按钮 -->
  <div
    ref="triggerRef"
    class="themeBtn common-right-tool-btn opacity-70 text-white common-focus-visible-btn-outline"
    @click="switchFilterMenu"
    @keydown.enter="switchFilterMenu"
    tabindex="0"
    role="button"
  >
    <WUIIcon v-if="colorMode.value === 'light'" name="i-heroicons-sun" />
    <WUIIcon v-else-if="colorMode.value === 'dark'" name="i-heroicons-moon" />
  </div>
  <transition name="fade">
    <div
      class="common-right-tool-menu-body"
      v-show="showFilterMenu"
      ref="menuRef"
      @keydown.tab="e => trapFocus(menuRef, e)"
      @keydown.esc="showFilterMenu = false"
      tabindex="-1"
    >
      <div class="common-right-tool-menu-box">
        <div
          class="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-solid border-gray-200 dark:border-gray-700 text-base px-4 py-3"
        >
          <div>主题模式</div>
          <button
            class="text-gray-500 hover:text-gray-700 common-focus-visible-btn-outline"
            @click="switchFilterMenu"
          >
            <WUIIcon name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="custom-scroll common-right-tool-menu">
          <ul class="common-right-tool-menu-item-ul">
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded common-focus-visible-btn-outline"
                :class="{ active: colorMode.preference === 'system' }"
                @click="setColorMode('system')"
                @keydown.enter="setColorMode('system')"
                :tabindex="colorMode.preference === 'system' ? '-1' : '0'"
                role="button"
              >
                跟随系统
              </div>
            </li>
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded common-focus-visible-btn-outline"
                :class="{
                  active: colorMode.preference === 'light'
                }"
                @click="setColorMode('light')"
                @keydown.enter="setColorMode('light')"
                :tabindex="colorMode.preference === 'light' ? '-1' : '0'"
                role="button"
              >
                浅色模式
              </div>
            </li>
            <li>
              <div
                class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded common-focus-visible-btn-outline"
                :class="{ active: colorMode.preference === 'dark' }"
                @click="setColorMode('dark')"
                @keydown.enter="setColorMode('dark')"
                :tabindex="colorMode.preference === 'dark' ? '-1' : '0'"
                role="button"
              >
                深色模式
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
const menuRef = ref(null)
const triggerRef = ref(null)

// 使用 useOutsideClick 监听外部点击，忽略触发按钮
useOutsideClick(
  menuRef,
  () => {
    console.log('外部点击，关闭菜单')
    if (showFilterMenu.value) {
      console.log('关闭主题切换菜单')
      showFilterMenu.value = false
    }
  },
  {
    ignore: [triggerRef]
  }
)

// 切换主题
const setColorMode = mode => {
  colorMode.preference = mode
  showFilterMenu.value = false
}

// 切换菜单显示状态
const switchFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}

// 监听菜单显示状态，自动聚焦
watch(showFilterMenu, val => {
  if (val) {
    nextTick(() => {
      menuRef.value?.focus()
    })
  } else {
    triggerRef.value?.focus()
  }
})
</script>

<style scoped></style>
