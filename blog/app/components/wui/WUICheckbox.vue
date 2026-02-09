<template>
  <label
    class="wui-checkbox"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <input
      type="checkbox"
      class="wui-checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="wui-checkbox-box text-white h5">
      <WUIIcon
        v-if="modelValue"
        name="i-heroicons-check-20-solid"
        class="w-3 h-3"
      />
    </span>
    <span v-if="label" class="wui-checkbox-label">{{ label }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.wui-checkbox {
  @apply items-center cursor-pointer select-none gap-x-2;
}

.wui-checkbox-input {
  @apply sr-only;
}

.wui-checkbox-box {
  @apply w-4 h-4 rounded flex items-center justify-center flex-shrink-0
    border border-gray-300 dark:border-gray-500
    transition-colors duration-150;
}

.wui-checkbox-input:checked + .wui-checkbox-box {
  @apply bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400;
}

.wui-checkbox-input:focus-visible + .wui-checkbox-box {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.wui-checkbox-label {
  @apply text-sm text-gray-700 dark:text-gray-200;
}
</style>
