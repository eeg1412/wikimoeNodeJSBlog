<template>
  <div class="wui-form-group" :class="$attrs.class">
    <label v-if="label" class="wui-form-group-label" :for="name">{{
      label
    }}</label>
    <div class="wui-form-group-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { provide } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  error: { type: [String, Boolean], default: '' }
})

provide('form-group', props)
</script>

<style scoped>
.wui-form-group {
  @apply space-y-1;
}

.wui-form-group-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-200;
}
</style>
