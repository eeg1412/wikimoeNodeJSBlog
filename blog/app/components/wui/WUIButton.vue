<template>
  <button
    class="wui-button"
    :class="[buttonClasses, $attrs.class]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="wui-button-loading">
      <WUIIcon
        name="i-heroicons-arrow-path-20-solid"
        class="animate-spin"
        :class="iconClass"
      />
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
  size: { type: String, default: 'sm' },
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

// Matches Nuxt UI 2 button.ts exactly
const sizeClasses = {
  '2xs': 'text-xs gap-x-1',
  xs: 'text-xs gap-x-1.5',
  sm: 'text-sm gap-x-1.5',
  md: 'text-sm gap-x-2',
  lg: 'text-sm gap-x-2.5',
  xl: 'text-base gap-x-2.5'
}

const paddingClasses = {
  '2xs': 'px-2 py-1',
  xs: 'px-2.5 py-1.5',
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2',
  lg: 'px-3.5 py-2.5',
  xl: 'px-3.5 py-2.5'
}

const squareClasses = {
  '2xs': 'p-1',
  xs: 'p-1.5',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-2.5'
}

const iconSizeClasses = {
  '2xs': 'w-4 h-4',
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
}

const colorVariantClasses = computed(() => {
  const c = props.color
  const v = props.variant

  // Matches Nuxt UI 2 button.ts color/variant config
  const map = {
    primary: {
      solid:
        'shadow-sm text-white dark:text-gray-900 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500 dark:bg-primary-400 dark:hover:bg-primary-500 dark:disabled:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400',
      outline:
        'ring-1 ring-inset ring-current text-primary-500 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      soft: 'text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 disabled:bg-primary-50 dark:bg-primary-950 dark:hover:bg-primary-900 dark:disabled:bg-primary-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      ghost:
        'text-primary-500 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      link: 'text-primary-500 hover:text-primary-600 disabled:text-primary-500 dark:text-primary-400 dark:hover:text-primary-500 dark:disabled:text-primary-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
    },
    gray: {
      solid:
        'shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 dark:disabled:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      ghost:
        'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      link: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline-offset-4 hover:underline focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      outline:
        'ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:bg-transparent dark:hover:bg-gray-800 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      soft: 'text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:bg-gray-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
    },
    white: {
      solid:
        'shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-900 dark:text-white bg-white hover:bg-gray-50 disabled:bg-white dark:bg-gray-900 dark:hover:bg-gray-800/50 dark:disabled:bg-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      ghost:
        'text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      link: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline-offset-4 hover:underline focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      outline:
        'ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 disabled:bg-transparent dark:hover:bg-gray-800 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      soft: 'text-gray-900 dark:text-white bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:bg-gray-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
    },
    black: {
      solid:
        'shadow-sm text-white dark:text-gray-900 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:disabled:bg-white focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      link: 'text-gray-900 dark:text-white underline-offset-4 hover:underline focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
    },
    red: {
      solid:
        'shadow-sm text-white dark:text-gray-900 bg-red-500 hover:bg-red-600 disabled:bg-red-500 dark:bg-red-400 dark:hover:bg-red-500 dark:disabled:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:focus-visible:outline-red-400',
      outline:
        'ring-1 ring-inset ring-current text-red-500 dark:text-red-400 hover:bg-red-50 disabled:bg-transparent dark:hover:bg-red-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400',
      soft: 'text-red-500 dark:text-red-400 bg-red-50 hover:bg-red-100 disabled:bg-red-50 dark:bg-red-950 dark:hover:bg-red-900 dark:disabled:bg-red-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 dark:focus-visible:ring-red-400',
      ghost:
        'text-red-500 dark:text-red-400 hover:bg-red-50 disabled:bg-transparent dark:hover:bg-red-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 dark:focus-visible:ring-red-400',
      link: 'text-red-500 hover:text-red-600 disabled:text-red-500 dark:text-red-400 dark:hover:text-red-500 dark:disabled:text-red-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 dark:focus-visible:ring-red-400'
    },
    green: {
      solid:
        'shadow-sm text-white dark:text-gray-900 bg-green-500 hover:bg-green-600 disabled:bg-green-500 dark:bg-green-400 dark:hover:bg-green-500 dark:disabled:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 dark:focus-visible:outline-green-400',
      outline:
        'ring-1 ring-inset ring-current text-green-500 dark:text-green-400 hover:bg-green-50 disabled:bg-transparent dark:hover:bg-green-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-green-500 dark:focus-visible:ring-green-400',
      soft: 'text-green-500 dark:text-green-400 bg-green-50 hover:bg-green-100 disabled:bg-green-50 dark:bg-green-950 dark:hover:bg-green-900 dark:disabled:bg-green-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 dark:focus-visible:ring-green-400',
      ghost:
        'text-green-500 dark:text-green-400 hover:bg-green-50 disabled:bg-transparent dark:hover:bg-green-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 dark:focus-visible:ring-green-400',
      link: 'text-green-500 hover:text-green-600 disabled:text-green-500 dark:text-green-400 dark:hover:text-green-500 dark:disabled:text-green-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 dark:focus-visible:ring-green-400'
    }
  }

  const colorMap = map[c] || map.primary
  return colorMap[v] || colorMap.solid
})

const iconClass = computed(() => {
  return iconSizeClasses[props.size] || iconSizeClasses.sm
})

const buttonClasses = computed(() => {
  const classes = []

  // Text size + gap
  classes.push(sizeClasses[props.size] || sizeClasses.sm)

  // Padding / square / icon-only
  const isIconOnly =
    (props.icon || props.trailingIcon) && !hasContent.value && !props.label
  if (isIconOnly) {
    classes.push(squareClasses[props.size] || squareClasses.sm)
  } else if (props.square) {
    classes.push(squareClasses[props.size] || squareClasses.sm)
  } else if (props.padded) {
    classes.push(paddingClasses[props.size] || paddingClasses.sm)
  } else {
    classes.push('p-0')
  }

  // Color + variant
  classes.push(colorVariantClasses.value)

  // Block
  if (props.block) {
    classes.push('w-full justify-center')
  }

  return classes.filter(Boolean).join(' ')
})
</script>

<style scoped>
.wui-button {
  @apply inline-flex items-center flex-shrink-0 font-medium rounded-md cursor-pointer
    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline
    transition-colors duration-200
    disabled:cursor-not-allowed disabled:opacity-75;
}

.wui-button-loading {
  @apply flex items-center;
}

.wui-button-label {
  @apply truncate;
}
</style>
