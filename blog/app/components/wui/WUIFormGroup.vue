<template>
  <div class="wui-form-group" :class="$attrs.class">
    <label v-if="label" class="wui-form-group-label" :for="name">{{
      label
    }}</label>
    <div class="wui-form-group-content">
      <slot />
    </div>
    <p v-if="error" class="wui-form-group-error">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  error: { type: [String, Boolean], default: '' }
})
</script>

<style scoped>
.wui-form-group {
  @apply space-y-1;
}

.wui-form-group-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-200;
}

.wui-form-group-error {
  @apply text-sm text-red-500 dark:text-red-400;
}
</style>
