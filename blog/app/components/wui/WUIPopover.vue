<template>
  <div class="wui-popover" ref="popoverRef">
    <div ref="triggerRef" class="wui-popover-trigger" @click="toggle">
      <slot />
    </div>
    <Teleport to="body">
      <Transition name="wui-popover-transition">
        <div
          v-if="isOpen"
          ref="panelRef"
          class="wui-popover-panel"
          :style="panelStyle"
        >
          <div
            v-if="arrow"
            class="wui-popover-arrow"
            :class="[side === 'top' ? '-bottom-1' : '-top-1']"
            :style="arrowStyle"
          ></div>
          <div class="wui-popover-content">
            <slot name="panel" :close="close" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  popper: {
    type: Object,
    default: () => ({})
  },
  zIndex: { type: Number, default: 10 }
})

const emit = defineEmits(['update:open'])

const popoverRef = ref(null)
const triggerRef = ref(null)
const panelRef = ref(null)
const internalOpen = ref(false)
const panelPosition = ref({ top: 0, left: 0 })
const arrowPosition = ref({ left: 0 })
const side = ref('bottom')

const arrow = computed(() => props.popper?.arrow ?? false)

const isOpen = computed({
  get: () => (props.open !== undefined ? props.open : internalOpen.value),
  set: val => {
    if (props.open !== undefined) {
      emit('update:open', val)
    } else {
      internalOpen.value = val
    }
  }
})

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function updatePosition() {
  if (!triggerRef.value || !panelRef.value) return

  const triggerEl = triggerRef.value
  const panelEl = panelRef.value
  const rect = triggerEl.getBoundingClientRect()
  const panelRect = panelEl.getBoundingClientRect()
  const offsetDistance = props.popper?.offsetDistance ?? 8

  let top = rect.bottom + offsetDistance
  let left = rect.left + rect.width / 2 - panelRect.width / 2
  side.value = 'bottom'

  // Keep panel within viewport
  const viewportWidth = window.innerWidth
  if (left < 8) left = 8
  if (left + panelRect.width > viewportWidth - 8) {
    left = viewportWidth - panelRect.width - 8
  }

  // Check if panel goes below viewport, flip to top
  if (rect.bottom + offsetDistance + panelRect.height > window.innerHeight) {
    top = rect.top - panelRect.height - offsetDistance
    side.value = 'top'
  }

  panelPosition.value = { top, left }

  // Arrow position
  const triggerCenter = rect.left + rect.width / 2
  const arrowLeft = triggerCenter - left
  arrowPosition.value = {
    left: Math.max(12, Math.min(arrowLeft, panelRect.width - 12))
  }
}

const panelStyle = computed(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  transform: `translate(${panelPosition.value.left}px, ${panelPosition.value.top}px)`,
  zIndex: props.zIndex
}))

const arrowStyle = computed(() => ({
  left: `${arrowPosition.value.left}px`
}))

// Update position when opened
watch(isOpen, async val => {
  if (val) {
    await nextTick()
    updatePosition()
  }
})

// Click outside to close
function handleClickOutside(e) {
  if (!isOpen.value) return
  if (popoverRef.value?.contains(e.target)) return
  if (panelRef.value?.contains(e.target)) return
  close()
}

// Update position on scroll/resize
function handleScrollResize() {
  if (isOpen.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('scroll', handleScrollResize, true)
  window.addEventListener('resize', handleScrollResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('scroll', handleScrollResize, true)
  window.removeEventListener('resize', handleScrollResize)
})

defineExpose({ close })
</script>

<style scoped>
.wui-popover {
  @apply relative inline-flex;
}

.wui-popover-trigger {
  @apply inline-flex;
}

.wui-popover-panel {
  @apply relative;
}

.wui-popover-content {
  @apply bg-white dark:bg-gray-900
    rounded-lg shadow-lg
    ring-1 ring-gray-200 dark:ring-gray-800
    relative z-10;
}

.wui-popover-arrow {
  @apply absolute w-3 h-3 -translate-x-1/2
    bg-gray-200 dark:bg-gray-800
    transform rotate-45
    z-0;
}

.wui-popover-transition-enter-active,
.wui-popover-transition-leave-active {
  transition: opacity 0.15s ease;
  /* transform 0.15s ease; */
}

.wui-popover-transition-enter-from,
.wui-popover-transition-leave-to {
  opacity: 0;
  /* transform: translateY(-4px); */
}
</style>
