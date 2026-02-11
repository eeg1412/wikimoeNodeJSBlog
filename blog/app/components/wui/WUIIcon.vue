<template>
  <Icon
    :name="transformedName"
    :class="['wui-icon', props.class]"
    :size="props.size"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  class: {
    type: [String, Object, Array],
    default: ''
  },
  size: {
    type: [String, Number],
    default: undefined
  }
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
  display: inline-block;
  flex-shrink: 0;
}
</style>
