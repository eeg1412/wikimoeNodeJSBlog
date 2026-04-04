<template>
  <div class="wui-image-tabs">
    <button
      v-if="hasOverflow"
      type="button"
      class="wui-image-tabs-arrow"
      :disabled="!canScrollPrev"
      title="查看前面的分组"
      @click="scrollTabs(-1)"
    >
      <WUIIcon name="i-heroicons-chevron-left-20-solid" class="w-6 h-6" />
    </button>

    <div ref="listRef" class="wui-image-tabs-list" @wheel.prevent="handleWheel">
      <button
        v-for="(item, index) in items"
        :key="item.key || item._id || index"
        :ref="element => setItemRef(element, index)"
        type="button"
        class="wui-image-tabs-item"
        :class="{
          active: modelValue === index,
          'icon-only': item.image && item.showLabel === false
        }"
        :title="item.title || item.label"
        @click="updateValue(index)"
      >
        <span v-if="item.image" class="wui-image-tabs-thumb">
          <img :src="item.image" :alt="item.title || item.label" />
        </span>
        <span
          v-if="item.label && (item.showLabel !== false || !item.image)"
          class="wui-image-tabs-label"
        >
          {{ item.label }}
        </span>
      </button>
    </div>

    <button
      v-if="hasOverflow"
      type="button"
      class="wui-image-tabs-arrow"
      :disabled="!canScrollNext"
      title="查看后面的分组"
      @click="scrollTabs(1)"
    >
      <WUIIcon name="i-heroicons-chevron-right-20-solid" class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  },
  maxVisible: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue'])

const listRef = ref(null)
const itemRefs = ref([])
const hasOverflow = ref(false)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)
let resizeObserver = null
let resizeTimer = null

const updateScrollState = () => {
  const listElement = listRef.value
  if (!listElement) {
    return
  }
  const maxScrollLeft = listElement.scrollWidth - listElement.clientWidth
  hasOverflow.value = maxScrollLeft > 1
  canScrollPrev.value = listElement.scrollLeft > 1
  canScrollNext.value = listElement.scrollLeft < maxScrollLeft - 1
}

const getItemKey = (item, index) => {
  const rawKey = item?.key ?? item?._id ?? item?.label ?? index
  return String(rawKey)
}

const setItemRef = (element, index) => {
  if (element) {
    itemRefs.value[index] = element
  }
}

const ensureVisible = (index, behavior = 'auto') => {
  nextTick(() => {
    const targetElement = itemRefs.value[index]
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'center'
      })
    }
    updateScrollState()
  })
}

const scheduleLayoutUpdate = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }

  resizeTimer = setTimeout(() => {
    resizeTimer = null
    updateScrollState()
    ensureVisible(props.modelValue, 'auto')
  }, 80)
}

const updateValue = index => {
  emit('update:modelValue', index)
  ensureVisible(index)
}

const scrollTabs = step => {
  const listElement = listRef.value
  if (!listElement) {
    return
  }
  const scrollDistance = Math.max(listElement.clientWidth * 0.6, 160) * step
  listElement.scrollBy({
    left: scrollDistance,
    behavior: 'smooth'
  })
  requestAnimationFrame(updateScrollState)
}

const handleWheel = event => {
  if (!hasOverflow.value || !listRef.value) {
    return
  }
  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY
  if (delta === 0) {
    return
  }
  listRef.value.scrollLeft += delta
  updateScrollState()
}

const handleResize = () => {
  scheduleLayoutUpdate()
}

onMounted(() => {
  if (listRef.value) {
    listRef.value.addEventListener('scroll', updateScrollState, {
      passive: true
    })
  }

  if (typeof ResizeObserver !== 'undefined' && listRef.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleLayoutUpdate()
    })
    resizeObserver.observe(listRef.value)
  } else {
    window.addEventListener('resize', handleResize)
  }

  updateScrollState()
  ensureVisible(props.modelValue, 'auto')
})

onUnmounted(() => {
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', updateScrollState)
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener('resize', handleResize)
  }

  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
})

watch(
  () => props.modelValue,
  value => {
    ensureVisible(value, 'auto')
  },
  { immediate: true }
)

watch(
  () => props.items.map((item, index) => getItemKey(item, index)).join('|'),
  () => {
    itemRefs.value = []
    if (props.items.length === 0) {
      nextTick(updateScrollState)
      return
    }
    if (props.modelValue > props.items.length - 1) {
      emit('update:modelValue', props.items.length - 1)
      return
    }
    ensureVisible(props.modelValue, 'auto')
  },
  { immediate: true }
)
</script>

<style scoped>
.wui-image-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.wui-image-tabs-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  background: rgb(243, 244, 246);
  border-radius: 0.5rem;
  padding: 0.25rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
}

.wui-image-tabs-list::-webkit-scrollbar {
  display: none;
}

.dark .wui-image-tabs-list {
  background: rgb(31, 41, 55);
}

.wui-image-tabs-arrow {
  width: 18px;
  height: 56px;
  min-height: 56px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: rgb(107, 114, 128);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .wui-image-tabs-arrow {
  color: rgb(156, 163, 175);
}

.wui-image-tabs-arrow:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.7);
}

.dark .wui-image-tabs-arrow:not(:disabled):hover {
  background: rgba(17, 24, 39, 0.7);
}

.wui-image-tabs-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.wui-image-tabs-item {
  flex: 0 0 auto;
  min-width: 52px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgb(107, 114, 128);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  min-width: 0;
}

.dark .wui-image-tabs-item {
  color: rgb(156, 163, 175);
}

.wui-image-tabs-item:hover {
  color: rgb(17, 24, 39);
}

.wui-image-tabs-item.active {
  background: rgb(255, 255, 255);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  color: rgb(17, 24, 39);
}

.dark .wui-image-tabs-item.active {
  background: rgb(17, 24, 39);
  color: rgb(255, 255, 255);
}

.wui-image-tabs-thumb {
  width: 70%;
  height: 70%;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dark .wui-image-tabs-thumb {
  background: rgba(15, 23, 42, 0.82);
}

.wui-image-tabs-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.wui-image-tabs-label {
  max-width: 96px;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @apply text-sm font-medium rounded-md text-gray-500 dark:text-gray-400;
}

.wui-image-tabs-item {
  min-width: 56px;
}
</style>
