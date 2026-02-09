<template>
  <Icon
    :name="transformedName"
    class="wui-icon"
    :class="[sizeClass, $attrs.class]"
    :style="customSizeStyle"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: null
  }
})

const sizeMap = {
  '2xs': 'w-3 h-3',
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  '2xl': 'w-8 h-8'
}

const sizeClass = computed(() => {
  if (props.size && sizeMap[props.size]) {
    return sizeMap[props.size]
  }
  if (!props.size) {
    return 'w-5 h-5'
  }
  return ''
})

const customSizeStyle = computed(() => {
  if (props.size && !sizeMap[props.size]) {
    const s = typeof props.size === 'number' ? `${props.size}px` : props.size
    return { width: s, height: s }
  }
  return {}
})

// Transform 'i-heroicons-xxx' to 'heroicons:xxx'
const transformedName = computed(() => {
  if (props.name.startsWith('i-heroicons-')) {
    return props.name.replace('i-heroicons-', 'heroicons:')
  }
  return props.name
})
</script>

<style scoped>
.wui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}
</style>
