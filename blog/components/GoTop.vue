<template>
  <transition name="fade">
    <div
      class="goTopBtn bg-primary-400 opacity-70 hover:bg-primary-500 hover:opacity-100 text-white"
      v-show="showButton"
      ref="goTopBtnRef"
      @click="goTop"
    >
      <UIcon name="i-heroicons-arrow-up" />
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
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.goTopBtn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  padding: 10px;
}
.goTopBtn:hover {
  opacity: 1;
}
@media (hover: none) {
  .goTopBtn:hover {
    background-color: bg-primary-400;
    opacity: 0.7;
  }
}
</style>
