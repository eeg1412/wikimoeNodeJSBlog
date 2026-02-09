<template>
  <span class="wui-badge" :class="[badgeClasses, $attrs.class]">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, default: 'primary' },
  variant: { type: String, default: 'solid' },
  size: { type: String, default: 'sm' }
})

const sizeClasses = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5'
}

const badgeClasses = computed(() => {
  const classes = [sizeClasses[props.size] || sizeClasses.sm]

  const colorMap = {
    primary: {
      solid: 'bg-primary-500 text-white dark:bg-primary-400 dark:text-gray-900',
      outline:
        'text-primary-500 ring-1 ring-inset ring-primary-500 dark:text-primary-400 dark:ring-primary-400',
      soft: 'text-primary-500 bg-primary-50 dark:text-primary-400 dark:bg-primary-950',
      subtle:
        'text-primary-500 bg-primary-50 ring-1 ring-inset ring-primary-200 dark:text-primary-400 dark:bg-primary-950 dark:ring-primary-800'
    },
    gray: {
      solid: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
      outline:
        'text-gray-700 ring-1 ring-inset ring-gray-300 dark:text-gray-200 dark:ring-gray-600',
      soft: 'text-gray-700 bg-gray-50 dark:text-gray-200 dark:bg-gray-800',
      subtle:
        'text-gray-700 bg-gray-50 ring-1 ring-inset ring-gray-200 dark:text-gray-200 dark:bg-gray-800 dark:ring-gray-700'
    },
    white: {
      solid:
        'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700'
    },
    red: {
      solid: 'bg-red-500 text-white dark:bg-red-400 dark:text-gray-900',
      outline:
        'text-red-500 ring-1 ring-inset ring-red-500 dark:text-red-400 dark:ring-red-400',
      soft: 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950'
    },
    green: {
      solid: 'bg-green-500 text-white dark:bg-green-400 dark:text-gray-900',
      outline:
        'text-green-500 ring-1 ring-inset ring-green-500 dark:text-green-400 dark:ring-green-400',
      soft: 'text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950'
    }
  }

  const colorStyles = colorMap[props.color] || colorMap.primary
  classes.push(colorStyles[props.variant] || colorStyles.solid)

  return classes.join(' ')
})
</script>

<style scoped>
.wui-badge {
  @apply inline-flex items-center font-medium rounded-md whitespace-nowrap;
}
</style>
