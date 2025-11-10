import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useIsFullscreenStore = defineStore('isFullscreen', () => {
  const isFullscreen = ref(false)
  function setFullscreen(status) {
    isFullscreen.value = status
  }
  return { isFullscreen, setFullscreen }
})
