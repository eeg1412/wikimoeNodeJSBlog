import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 响应式移动端检测 composable
 * @param {number} breakpoint - 断点宽度，默认 768px
 * @returns {{ isMobile: import('vue').Ref<boolean> }}
 */
export function useIsMobile(breakpoint = 768) {
  const isMobile = ref(false)
  let mediaQuery = null
  let handler = null

  const update = e => {
    isMobile.value = e.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    isMobile.value = mediaQuery.matches
    handler = update
    mediaQuery.addEventListener('change', handler)
  })

  onUnmounted(() => {
    if (mediaQuery && handler) {
      mediaQuery.removeEventListener('change', handler)
    }
  })

  return { isMobile }
}
