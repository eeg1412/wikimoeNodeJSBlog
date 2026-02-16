<template>
  <transition name="fade">
    <div
      class="goTopBtn common-right-tool-btn opacity-70 text-white common-focus-visible-btn-outline"
      v-show="showButton"
      ref="goTopBtnRef"
      @click="goTop"
      @keydown.enter="goTop"
      tabindex="0"
    >
      <WUIIcon name="i-heroicons-arrow-up" />
    </div>
  </transition>
</template>

<script setup>
const showButton = ref(false)

let timer = null

const goTopBtnRef = ref(null)
const checkScroll = () => {
  if (timer) {
    clearTimeout(timer)
  }

  timer = setTimeout(() => {
    const scrollTop = Math.max(
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    showButton.value = scrollTop > 100
  }, 100)
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  checkScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

const goTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style scoped></style>
