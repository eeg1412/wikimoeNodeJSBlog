// src/composables/useTheme.js
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { applyThemeToDom } from '@/utils/theme.js'

export function useTheme() {
  const theme = ref('light') // 当前使用的主题
  const systemTheme = ref('light') // 系统主题
  const followSystem = ref(true) // 是否跟随系统
  const systemPreferenceSupported = ref(false) // 系统是否支持主题检测

  // 检测系统是否支持暗色模式偏好
  const checkSystemSupport = () => {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all'
    )
  }

  // 检测系统主题
  const detectSystemTheme = () => {
    if (!checkSystemSupport()) {
      systemPreferenceSupported.value = false
      return
    }

    systemPreferenceSupported.value = true
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    systemTheme.value = isDarkMode ? 'dark' : 'light'

    if (followSystem.value) {
      theme.value = systemTheme.value
    }
  }

  // 应用主题
  const applyTheme = newTheme => {
    applyThemeToDom(newTheme)
    localStorage.setItem('theme-preference', newTheme)
    localStorage.setItem('theme-follow-system', followSystem.value)
  }

  // 手动设置主题
  const setTheme = newTheme => {
    const validThemes = ['light', 'dark']
    if (!validThemes.includes(newTheme)) return
    theme.value = newTheme
    followSystem.value = false
    applyTheme(newTheme)
  }

  // 切换是否跟随系统
  const toggleFollowSystem = value => {
    followSystem.value = value
    if (value) {
      theme.value = systemTheme.value
    }
    applyTheme(theme.value)
    localStorage.setItem('theme-follow-system', value)
  }

  // 创建一个安全的事件监听器
  let mediaQuery = null
  const handleSystemThemeChange = event => {
    systemTheme.value = event.matches ? 'dark' : 'light'

    if (followSystem.value) {
      theme.value = systemTheme.value
      applyTheme(theme.value)
    }
  }

  const syncThemeOnResume = () => {
    if (!followSystem.value) return
    if (document.visibilityState && document.visibilityState !== 'visible') {
      return
    }

    detectSystemTheme()
    applyTheme(theme.value)
  }

  const setupMediaListener = () => {
    if (!systemPreferenceSupported.value) return

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return
    }
    mediaQuery.addListener(handleSystemThemeChange)
  }

  // 移除事件监听
  const cleanupMediaListener = () => {
    if (!mediaQuery) return

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      return
    }
    mediaQuery.removeListener(handleSystemThemeChange)
  }

  onMounted(() => {
    // 检测系统主题和支持情况
    detectSystemTheme()

    // 恢复保存的设置
    const savedTheme = localStorage.getItem('theme-preference')
    const savedFollowSystem = localStorage.getItem('theme-follow-system')

    // 如果系统支持主题检测，使用保存的设置或默认跟随系统
    if (systemPreferenceSupported.value) {
      followSystem.value =
        savedFollowSystem !== null ? savedFollowSystem === 'true' : true
    } else {
      // 系统不支持，强制不跟随
      followSystem.value = false
    }

    // 如果不跟随系统或有保存的主题，使用保存的主题
    if (!followSystem.value && savedTheme) {
      theme.value = savedTheme
    } else if (followSystem.value) {
      // 跟随系统，使用系统主题
      theme.value = systemTheme.value
    }

    // 应用主题
    applyTheme(theme.value)

    // 设置系统主题变化的监听
    setupMediaListener()

    document.addEventListener('visibilitychange', syncThemeOnResume)
    window.addEventListener('pageshow', syncThemeOnResume)
  })

  // 组件销毁时清理监听器
  onUnmounted(() => {
    cleanupMediaListener()
    document.removeEventListener('visibilitychange', syncThemeOnResume)
    window.removeEventListener('pageshow', syncThemeOnResume)
  })

  // 监听主题变化
  watch(theme, newTheme => {
    applyTheme(newTheme)
  })

  return {
    theme,
    systemTheme,
    followSystem,
    systemPreferenceSupported,
    setTheme,
    toggleFollowSystem
  }
}
