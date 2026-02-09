<template>
  <span class="wui-avatar" :class="[sizeClasses, $attrs.class]">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="wui-avatar-img"
      @error="onError"
    />
    <span v-else class="wui-avatar-placeholder">
      {{ initials }}
    </span>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: String, default: 'md' }
})

const imgError = ref(false)

const sizeMap = {
  '2xs': 'w-5 h-5 text-[8px]',
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-16 h-16 text-xl',
  '3xl': 'w-20 h-20 text-2xl'
}

const sizeClasses = computed(() => sizeMap[props.size] || sizeMap.md)

const initials = computed(() => {
  if (!props.alt) return '?'
  return props.alt
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function onError() {
  imgError.value = true
}
</script>

<style scoped>
.wui-avatar {
  @apply inline-flex items-center justify-center flex-shrink-0
    rounded-full bg-gray-100 dark:bg-gray-800
    overflow-hidden;
}

.wui-avatar-img {
  @apply w-full h-full object-cover;
}

.wui-avatar-placeholder {
  @apply font-medium text-gray-600 dark:text-gray-300;
}
</style>
