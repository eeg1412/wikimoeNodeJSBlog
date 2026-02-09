<template>
  <div class="wui-input-wrapper" :class="[wrapperClasses, $attrs.class]">
    <span
      v-if="icon && !trailing"
      class="wui-input-icon wui-input-icon-leading"
    >
      <WUIIcon :name="icon" class="text-gray-400 dark:text-gray-500 w-4 h-4" />
    </span>
    <input
      ref="inputRef"
      class="wui-input"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :type="type"
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
import { computed, ref, useSlots, inject } from 'vue'

const slots = useSlots()
const formGroup = inject('form-group', null)

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: String, default: 'sm' },
  variant: { type: String, default: 'outline' },
  color: { type: String, default: 'white' },
  name: { type: String, default: '' },
  type: { type: String, default: 'text' },
  trailing: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: undefined },
  error: { type: [String, Boolean], default: false }
})

defineEmits(['update:modelValue', 'keydown', 'blur', 'focus'])

const inputRef = ref(null)

const sizeClasses = {
  '2xs': 'text-xs py-1',
  xs: 'text-xs py-1.5',
  sm: 'text-sm py-1.5',
  md: 'text-sm py-2',
  lg: 'text-sm py-2.5',
  xl: 'text-base py-2.5'
}

const isError = computed(
  () => !!props.error || (formGroup && !!formGroup.error)
)

const wrapperClasses = computed(() => {
  const classes = ['relative flex items-center']

  if (props.variant === 'none') {
    classes.push('border-0')
  } else {
    classes.push('rounded-md shadow-sm', 'bg-white dark:bg-gray-900')

    if (isError.value) {
      classes.push(
        'ring-1 ring-inset ring-red-500 dark:ring-red-400',
        'focus-within:ring-2 focus-within:ring-red-500 dark:focus-within:ring-red-400'
      )
    } else {
      classes.push(
        'ring-1 ring-inset ring-gray-300 dark:ring-gray-700',
        'focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400'
      )
    }
  }

  return classes.join(' ')
})

const inputClasses = computed(() => {
  const paddings = {
    '2xs': { normal: 'px-2', leading: 'ps-7 pe-2', trailing: 'ps-2 pe-7' },
    xs: { normal: 'px-2.5', leading: 'ps-8 pe-2.5', trailing: 'ps-2.5 pe-8' },
    sm: { normal: 'px-2.5', leading: 'ps-9 pe-2.5', trailing: 'ps-2.5 pe-9' },
    md: { normal: 'px-3', leading: 'ps-10 pe-3', trailing: 'ps-3 pe-10' },
    lg: { normal: 'px-3.5', leading: 'ps-11 pe-3.5', trailing: 'ps-3.5 pe-11' },
    xl: { normal: 'px-3.5', leading: 'ps-12 pe-3.5', trailing: 'ps-3.5 pe-12' }
  }
  const pad = paddings[props.size] || paddings.sm
  const classes = [
    'w-full border-0 bg-transparent',
    'text-gray-900 dark:text-white',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:ring-0',
    sizeClasses[props.size] || sizeClasses.sm
  ]

  if (props.icon && !props.trailing) {
    classes.push(pad.leading)
  } else if (slots.trailing) {
    classes.push(pad.trailing)
  } else {
    classes.push(pad.normal)
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
