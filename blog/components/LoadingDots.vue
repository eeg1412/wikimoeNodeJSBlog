<template>
  <span>{{ dots }}</span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const dots = ref('')
let interval

onMounted(() => {
  interval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
  }, 500)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
