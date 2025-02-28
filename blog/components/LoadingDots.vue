<template>
  <span>{{ dots }}</span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  showAnimeDot: {
    type: Boolean,
    default: true,
  },
})

const dots = ref(props.showAnimeDot ? '' : '...')
let interval

onMounted(() => {
  if (props.showAnimeDot) {
    interval = setInterval(() => {
      dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
    }, 500)
  }
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
