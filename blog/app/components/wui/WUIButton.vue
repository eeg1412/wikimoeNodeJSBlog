<template>
  <button
    class="wui-button"
    :class="[buttonClasses, $attrs.class]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="wui-button-loading">
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    <WUIIcon v-if="icon && !loading" :name="icon" :class="iconClass" />
    <span v-if="hasContent" class="wui-button-label">
      <slot>{{ label }}</slot>
    </span>
    <WUIIcon
      v-if="trailingIcon && !loading"
      :name="trailingIcon"
      :class="iconClass"
    />
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  trailingIcon: { type: String, default: '' },
  color: { type: String, default: 'primary' },
  variant: { type: String, default: 'solid' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  padded: { type: Boolean, default: true },
  square: { type: Boolean, default: false },
  trailing: { type: Boolean, default: true }
})

defineEmits(['click'])
const slots = useSlots()

const hasContent = computed(() => {
  return !!slots.default || !!props.label
})

const sizeClasses = {
  '2xs': 'text-xs px-1.5 py-0.5 gap-x-1',
  xs: 'text-xs px-2 py-1 gap-x-1',
  sm: 'text-sm px-2.5 py-1.5 gap-x-1.5',
  md: 'text-sm px-3 py-2 gap-x-2',
  lg: 'text-base px-3.5 py-2.5 gap-x-2.5',
  xl: 'text-base px-4 py-3 gap-x-3'
}

const iconSizeClasses = {
  '2xs': 'w-3.5 h-3.5',
  xs: 'w-4 h-4',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
}

const iconOnlySizeClasses = {
  '2xs': 'p-0.5',
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-3'
}

const colorVariantClasses = computed(() => {
  const c = props.color
  const v = props.variant

  const map = {
    primary: {
      solid:
        'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-500 focus-visible:outline-primary-500 disabled:bg-primary-300 dark:disabled:bg-primary-500/50',
      outline:
        'text-primary-500 ring-1 ring-inset ring-primary-500 hover:bg-primary-50 dark:text-primary-400 dark:ring-primary-400 dark:hover:bg-primary-950 disabled:text-primary-300 dark:disabled:text-primary-500/50',
      soft: 'text-primary-500 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-950 dark:hover:bg-primary-900 disabled:text-primary-300',
      ghost:
        'text-primary-500 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950 disabled:text-primary-300',
      link: 'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline dark:text-primary-400 dark:hover:text-primary-500 disabled:text-primary-300'
    },
    gray: {
      solid:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:text-gray-400',
      outline:
        'text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-800 disabled:text-gray-400',
      soft: 'text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:text-gray-400',
      ghost:
        'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 disabled:text-gray-400',
      link: 'text-gray-500 hover:text-gray-700 underline-offset-4 hover:underline dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300'
    },
    white: {
      solid:
        'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800 disabled:text-gray-400',
      outline:
        'text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-800 disabled:text-gray-400',
      soft: 'text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:text-gray-400',
      ghost:
        'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 disabled:text-gray-400',
      link: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300'
    },
    red: {
      solid:
        'bg-red-500 text-white hover:bg-red-600 dark:bg-red-400 dark:text-gray-900 dark:hover:bg-red-500 disabled:bg-red-300',
      outline:
        'text-red-500 ring-1 ring-inset ring-red-500 hover:bg-red-50 dark:text-red-400 dark:ring-red-400 dark:hover:bg-red-950 disabled:text-red-300',
      soft: 'text-red-500 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950 dark:hover:bg-red-900 disabled:text-red-300',
      ghost:
        'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 disabled:text-red-300',
      link: 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 disabled:text-red-300'
    }
  }

  const colorMap = map[c] || map.primary
  return colorMap[v] || colorMap.solid
})

const iconClass = computed(() => {
  return iconSizeClasses[props.size] || iconSizeClasses.md
})

const buttonClasses = computed(() => {
  const classes = []

  // size
  const isIconOnly =
    (props.icon || props.trailingIcon) && !hasContent.value && !props.label
  if (isIconOnly) {
    classes.push(iconOnlySizeClasses[props.size] || iconOnlySizeClasses.md)
  } else if (props.padded) {
    classes.push(sizeClasses[props.size] || sizeClasses.md)
  } else {
    classes.push(
      'p-0',
      sizeClasses[props.size]
        ?.replace(/px-\S+\s*/g, '')
        .replace(/py-\S+\s*/g, '') || ''
    )
  }

  // color
  classes.push(colorVariantClasses.value)

  // block
  if (props.block) {
    classes.push('w-full justify-center')
  }

  // square
  if (props.square) {
    classes.push('!p-1.5')
  }

  return classes.filter(Boolean).join(' ')
})
</script>

<style scoped>
.wui-button {
  @apply inline-flex items-center font-medium rounded-md cursor-pointer
    focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2
    transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-75;
}

.wui-button-loading {
  @apply flex items-center;
}

.wui-button-label {
  @apply truncate;
}
</style>
