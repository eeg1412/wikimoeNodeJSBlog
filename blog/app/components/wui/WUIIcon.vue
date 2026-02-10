<template>
  <Icon :name="transformedName" class="wui-icon" :class="$attrs.class" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
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
