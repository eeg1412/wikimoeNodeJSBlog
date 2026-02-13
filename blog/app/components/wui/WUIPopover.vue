<template>
  <div class="wui-popover" ref="popoverRef">
    <div class="wui-popover-trigger" @click="toggle">
      <slot />
    </div>
    <Teleport to="body">
      <div
        v-if="shouldRender"
        ref="containerRef"
        class="wui-popover-container"
        :style="containerStyle"
      >
        <Transition
          appear
          name="wui-popover-transition"
          @after-leave="onAfterLeave"
        >
          <div v-show="isOpen">
            <div
              v-if="showArrow"
              ref="arrowRef"
              class="wui-popover-arrow"
              data-popper-arrow
            ></div>
            <div class="wui-popover-content">
              <slot name="panel" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { usePopper } from '~/composables/usePopper'

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
const arrowRef = ref(null)

// 内部状态
const internalOpen = ref(false)
// shouldRender 控制容器的 v-if，过渡结束后才销毁
const shouldRender = ref(false)

const showArrow = computed(() => props.popper?.arrow ?? false)

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

// 合并 popper 配置
const popperOptions = computed(() => ({
  locked: props.popper?.locked ?? false,
  overflowPadding: props.popper?.overflowPadding ?? 8,
  offsetDistance: props.popper?.offsetDistance ?? 8,
  offsetSkid: props.popper?.offsetSkid ?? 0,
  gpuAcceleration: props.popper?.gpuAcceleration ?? true,
  adaptive: props.popper?.adaptive ?? true,
  scroll: props.popper?.scroll ?? true,
  resize: props.popper?.resize ?? true,
  arrow: props.popper?.arrow ?? false,
  placement: props.popper?.placement || 'bottom',
  strategy: props.popper?.strategy || 'fixed'
}))

// 使用 usePopper
const [referenceRef, containerRef, popperInstance] = usePopper(
  popperOptions.value
)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

// 过渡结束后销毁容器
function onAfterLeave() {
  shouldRender.value = false
}

// 容器样式 — zIndex 由 prop 控制
const containerStyle = computed(() => ({
  zIndex: props.zIndex
}))

// 点击外部关闭
function handleClickOutside(e) {
  if (popoverRef.value?.contains(e.target)) return
  if (containerRef.value?.contains(e.target)) return
  close()
}

function addListeners() {
  document.addEventListener('mousedown', handleClickOutside, true)
  document.addEventListener('touchstart', handleClickOutside, true)
}

function removeListeners() {
  document.removeEventListener('mousedown', handleClickOutside, true)
  document.removeEventListener('touchstart', handleClickOutside, true)
}

// 打开/关闭时维护事件监听 & 同步 popper reference
watch(isOpen, async val => {
  if (val) {
    // 先挂载容器
    shouldRender.value = true
    await nextTick()
    // 将 triggerRef 的真实 DOM 同步给 popper 的 reference
    syncReference()
    // 将 arrow DOM 同步给 popper modifier
    syncArrow()
    // 手动更新一次定位
    if (popperInstance.value) {
      popperInstance.value.forceUpdate()
    }
    addListeners()
  } else {
    // 关闭时仅移除监听，shouldRender 留到 @after-leave 再置 false
    removeListeners()
  }
})

/**
 * 将 trigger 元素赋值给 popper 的 reference ref
 * 因为 Teleport 导致 containerRef 与 triggerRef 不在同一 DOM 树内，
 * 需要手动将 trigger 的 DOM 节点交给 popper 定位
 */
function syncReference() {
  const triggerEl = popoverRef.value?.querySelector('.wui-popover-trigger')
  if (triggerEl) {
    referenceRef.value = triggerEl
  }
}

/**
 * 动态同步 arrow 元素给 popper 的 arrow modifier
 */
function syncArrow() {
  if (!popperInstance.value || !showArrow.value) return
  const arrowEl = arrowRef.value
  if (!arrowEl) return

  popperInstance.value.setOptions(prev => ({
    ...prev,
    modifiers: [
      ...(prev.modifiers || []).filter(m => m.name !== 'arrow'),
      {
        name: 'arrow',
        enabled: true,
        options: { element: arrowEl }
      }
    ]
  }))
}

onMounted(() => {
  if (isOpen.value) {
    shouldRender.value = true
    nextTick(() => {
      syncReference()
      addListeners()
    })
  }
})

onBeforeUnmount(() => {
  removeListeners()
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

.wui-popover-container {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: auto;
}

.wui-popover-content {
  @apply bg-white dark:bg-gray-900
    rounded-lg shadow-lg
    ring-1 ring-gray-200 dark:ring-gray-800
    relative;
  z-index: 1;
}

/* ============ Arrow ============ */
.wui-popover-arrow,
.wui-popover-arrow::before {
  @apply absolute w-2 h-2;
}

.wui-popover-arrow {
  visibility: hidden;
  z-index: 0;
}

.wui-popover-arrow::before {
  content: '';
  visibility: visible;
  @apply bg-gray-200 dark:bg-gray-800;
  transform: rotate(45deg);
}

/* 根据 popper 的 placement 自动定位箭头 */
.wui-popover-container[data-popper-placement^='top']
  > :first-child
  > .wui-popover-arrow {
  bottom: -4px;
}

.wui-popover-container[data-popper-placement^='bottom']
  > :first-child
  > .wui-popover-arrow {
  top: -4px;
}

.wui-popover-container[data-popper-placement^='left']
  > :first-child
  > .wui-popover-arrow {
  right: -4px;
}

.wui-popover-container[data-popper-placement^='right']
  > :first-child
  > .wui-popover-arrow {
  left: -4px;
}

/* ============ Transition ============ */
.wui-popover-transition-enter-active,
.wui-popover-transition-leave-active {
  transition: opacity 0.15s ease;
}

.wui-popover-transition-enter-from,
.wui-popover-transition-leave-to {
  opacity: 0;
}
</style>
