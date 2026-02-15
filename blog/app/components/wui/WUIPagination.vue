<template>
  <nav class="wui-pagination" :class="$attrs.class">
    <button
      v-if="showFirst"
      class="wui-pagination-btn"
      :class="firstBtnClasses"
      :disabled="modelValue <= 1"
      @click="goToPage(1)"
    >
      <WUIIcon
        name="i-heroicons-chevron-double-left-20-solid"
        class="w-4 h-4"
      />
    </button>
    <button
      class="wui-pagination-btn"
      :class="prevBtnClasses"
      :disabled="modelValue <= 1"
      @click="goToPage(modelValue - 1)"
    >
      <WUIIcon name="i-heroicons-chevron-left-20-solid" class="w-4 h-4" />
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="wui-pagination-ellipsis">…</span>
      <button
        v-else
        class="wui-pagination-btn"
        :class="page === modelValue ? activeBtnClasses : inactiveBtnClasses"
        :tabindex="page === modelValue ? '-1' : '0'"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="wui-pagination-btn"
      :class="nextBtnClasses"
      :disabled="modelValue >= totalPages"
      @click="goToPage(modelValue + 1)"
    >
      <WUIIcon name="i-heroicons-chevron-right-20-solid" class="w-4 h-4" />
    </button>
    <button
      v-if="showLast"
      class="wui-pagination-btn"
      :class="lastBtnClasses"
      :disabled="modelValue >= totalPages"
      @click="goToPage(totalPages)"
    >
      <WUIIcon
        name="i-heroicons-chevron-double-right-20-solid"
        class="w-4 h-4"
      />
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  pageCount: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  max: { type: Number, default: 7 },
  size: { type: String, default: 'md' },
  showFirst: { type: Boolean, default: false },
  showLast: { type: Boolean, default: false },
  activeButton: { type: Object, default: () => ({}) },
  inactiveButton: { type: Object, default: () => ({}) },
  firstButton: { type: Object, default: () => ({}) },
  lastButton: { type: Object, default: () => ({}) },
  prevButton: { type: Object, default: () => ({}) },
  nextButton: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageCount))
)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.modelValue
  const max = props.max

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []
  const half = Math.floor(max / 2)
  let start = current - half
  let end = current + half

  if (start < 1) {
    start = 1
    end = max
  }

  if (end > total) {
    end = total
    start = total - max + 1
  }

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = Math.max(start, 1); i <= Math.min(end, total); i++) {
    if (!pages.includes(i)) pages.push(i)
  }

  if (end < total) {
    if (end < total - 1) pages.push('...')
    if (!pages.includes(total)) pages.push(total)
  }

  return pages
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:modelValue', page)
  }
}

const sizeClasses = computed(() => {
  const map = {
    '2xs': 'text-xs min-w-5 h-5',
    xs: 'text-xs min-w-6 h-6',
    sm: 'text-sm min-w-7 h-7',
    md: 'text-sm min-w-8 h-8',
    lg: 'text-base min-w-9 h-9'
  }
  return map[props.size] || map.md
})

const activeBtnClasses = computed(() => {
  return `${sizeClasses.value} bg-primary-500 text-white dark:bg-primary-400 dark:text-gray-900`
})

const inactiveBtnClasses = computed(() => {
  return `${sizeClasses.value} text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800`
})

const navBtnBase = computed(
  () =>
    `${sizeClasses.value} text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`
)

const prevBtnClasses = computed(() => navBtnBase.value)
const nextBtnClasses = computed(() => navBtnBase.value)
const firstBtnClasses = computed(() => navBtnBase.value)
const lastBtnClasses = computed(() => navBtnBase.value)
</script>

<style scoped>
.wui-pagination {
  @apply inline-flex items-center gap-1;
}

.wui-pagination-btn {
  @apply inline-flex items-center justify-center rounded-md px-2 font-medium
    cursor-pointer transition-colors duration-150;
}

.wui-pagination-ellipsis {
  @apply inline-flex items-center justify-center px-1 text-gray-400;
}
.wui-pagination-btn:disabled {
  @apply cursor-not-allowed opacity-50;
}
.wui-pagination-btn:disabled:hover {
  @apply bg-transparent;
}
</style>
