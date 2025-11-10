import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePswpIsOpenStore = defineStore('pswpIsOpen', () => {
  const pswpIsOpen = ref(false)
  function setPswpIsOpen(status) {
    // console.error('setPswpIsOpen', status)
    pswpIsOpen.value = status
  }
  return { pswpIsOpen, setPswpIsOpen }
})
