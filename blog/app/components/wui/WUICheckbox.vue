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
    <span class="wui-checkbox-box">
      <svg
        v-if="modelValue"
        class="w-3 h-3 text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clip-rule="evenodd"
        />
      </svg>
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
  @apply inline-flex items-center cursor-pointer select-none gap-x-2;
}

.wui-checkbox-input {
  @apply sr-only;
}

.wui-checkbox-box {
  @apply w-4 h-4 rounded flex items-center justify-center flex-shrink-0
    border border-gray-300 dark:border-gray-600
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
