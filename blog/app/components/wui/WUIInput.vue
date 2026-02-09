<template>
  <div class="wui-input-wrapper" :class="[wrapperClasses, $attrs.class]">
    <span
      v-if="icon && !trailing"
      class="wui-input-icon wui-input-icon-leading"
    >
      <WUIIcon :name="icon" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
    </span>
    <input
      ref="inputRef"
      class="wui-input"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :type="inputType"
      :name="name"
      :readonly="readonly"
      :disabled="disabled"
      :maxlength="maxlength"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown="$emit('keydown', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <span v-if="$slots.trailing" class="wui-input-icon wui-input-icon-trailing">
      <slot name="trailing" />
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'outline' },
  color: { type: String, default: 'primary' },
  name: { type: String, default: '' },
  inputType: { type: String, default: 'text' },
  trailing: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: undefined }
})

defineEmits(['update:modelValue', 'keydown', 'blur', 'focus'])

const inputRef = ref(null)

const sizeClasses = {
  xs: 'text-xs py-1',
  sm: 'text-sm py-1.5',
  md: 'text-sm py-2',
  lg: 'text-base py-2.5',
  xl: 'text-lg py-3'
}

const wrapperClasses = computed(() => {
  const classes = ['relative flex items-center']

  if (props.variant === 'none') {
    classes.push('border-0')
  } else {
    classes.push(
      'rounded-md shadow-sm',
      'ring-1 ring-inset ring-gray-300 dark:ring-gray-700',
      'focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400',
      'bg-white dark:bg-gray-900'
    )
  }

  return classes.join(' ')
})

const inputClasses = computed(() => {
  const classes = [
    'w-full border-0 bg-transparent',
    'text-gray-900 dark:text-white',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:ring-0',
    sizeClasses[props.size] || sizeClasses.md
  ]

  if (props.icon && !props.trailing) {
    classes.push('pl-8 pr-3')
  } else {
    classes.push('px-3')
  }

  return classes.join(' ')
})

defineExpose({
  input: inputRef
})
</script>

<style scoped>
.wui-input-wrapper {
  @apply overflow-hidden;
}

.wui-input-icon {
  @apply absolute flex items-center pointer-events-none;
}

.wui-input-icon-leading {
  @apply left-2.5;
}

.wui-input-icon-trailing {
  @apply right-2 pointer-events-auto;
}
</style>
