// src/composables/useTheme.js
import { ref } from 'vue'
import { applyThemeToDom } from '@/utils/theme.js'

const SYSTEM_THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'
const VALID_THEMES = ['light', 'dark']

const theme = ref('light')
const systemTheme = ref('light')
const followSystem = ref(true)
const systemPreferenceSupported = ref(false)

let mediaQuery = null
let hasInitialized = false

const checkSystemSupport = () => {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia(SYSTEM_THEME_MEDIA_QUERY).media !== 'not all'
  )
}

const readSystemTheme = () => {
  if (!checkSystemSupport()) {
    systemPreferenceSupported.value = false
    systemTheme.value = 'light'
    return 'light'
  }

  systemPreferenceSupported.value = true
  const nextSystemTheme = window.matchMedia(SYSTEM_THEME_MEDIA_QUERY).matches
    ? 'dark'
    : 'light'
  systemTheme.value = nextSystemTheme
  return nextSystemTheme
}

const persistThemeState = () => {
  localStorage.setItem('theme-preference', theme.value)
  localStorage.setItem('theme-follow-system', String(followSystem.value))
}

const applyTheme = nextTheme => {
  if (!VALID_THEMES.includes(nextTheme)) return
  theme.value = nextTheme
  applyThemeToDom(nextTheme)
  persistThemeState()
}

const handleSystemThemeChange = event => {
  const nextSystemTheme = event.matches ? 'dark' : 'light'
  systemTheme.value = nextSystemTheme
  systemPreferenceSupported.value = true

  if (!followSystem.value) {
    return
  }

  applyTheme(nextSystemTheme)
}

const setupMediaListener = () => {
  if (mediaQuery || !systemPreferenceSupported.value) {
    return
  }

  mediaQuery = window.matchMedia(SYSTEM_THEME_MEDIA_QUERY)
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return
  }

  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleSystemThemeChange)
  }
}

export const initTheme = () => {
  if (hasInitialized) {
    return
  }

  const savedTheme = localStorage.getItem('theme-preference')
  const savedFollowSystem = localStorage.getItem('theme-follow-system')
  const nextSystemTheme = readSystemTheme()

  if (systemPreferenceSupported.value) {
    followSystem.value =
      savedFollowSystem !== null ? savedFollowSystem === 'true' : true
  } else {
    followSystem.value = false
  }

  if (!followSystem.value && VALID_THEMES.includes(savedTheme)) {
    applyTheme(savedTheme)
  } else {
    followSystem.value = systemPreferenceSupported.value
    applyTheme(nextSystemTheme)
  }

  setupMediaListener()
  hasInitialized = true
}

export function useTheme() {
  initTheme()

  const setTheme = newTheme => {
    if (!VALID_THEMES.includes(newTheme)) return
    followSystem.value = false
    applyTheme(newTheme)
  }

  const toggleFollowSystem = value => {
    followSystem.value = value && systemPreferenceSupported.value
    if (followSystem.value) {
      applyTheme(systemTheme.value)
      return
    }

    applyTheme(theme.value)
  }

  return {
    theme,
    systemTheme,
    followSystem,
    systemPreferenceSupported,
    setTheme,
    toggleFollowSystem
  }
}
