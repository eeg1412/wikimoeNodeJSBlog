<template>
  <div class="wui-textarea-wrapper" :class="$attrs.class">
    <textarea
      ref="textareaRef"
      class="wui-textarea"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown="$emit('keydown', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: [String, Number], default: 3 },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: undefined }
})

defineEmits(['update:modelValue', 'keydown', 'blur', 'focus'])

const textareaRef = ref(null)

defineExpose({
  textarea: textareaRef
})
</script>

<style scoped>
.wui-textarea-wrapper {
  @apply relative;
}

.wui-textarea {
  @apply w-full rounded-md border-0 px-3 py-2 text-sm
    text-gray-900 dark:text-white
    bg-white dark:bg-gray-900
    ring-1 ring-inset ring-gray-300 dark:ring-gray-700
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
    shadow-sm resize-y;
}
</style>
