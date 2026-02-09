<template>
  <div class="wui-textarea-wrapper" :class="$attrs.class">
    <textarea
      ref="textareaRef"
      class="wui-textarea"
      :class="{ 'wui-textarea-error': isError }"
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
import { ref, inject, computed } from 'vue'

const formGroup = inject('form-group', null)

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: [String, Number], default: 3 },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: undefined },
  error: { type: [String, Boolean], default: false }
})

defineEmits(['update:modelValue', 'keydown', 'blur', 'focus'])

const textareaRef = ref(null)
const isError = computed(
  () => !!props.error || (formGroup && !!formGroup.error)
)

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

.wui-textarea-error {
  @apply ring-1 ring-red-500 dark:ring-red-400 focus:ring-red-500 dark:focus:ring-red-400;
}
</style>
