<template>
  <Teleport to="body">
    <Transition name="wui-modal">
      <div
        v-if="modelValue"
        class="wui-modal-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="wui-modal-container overscroll-contain custom-scroll"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

// Prevent body scroll when modal is open
// watch(
//   () => props.modelValue,
//   val => {
//     if (val) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = ''
//     }
//   }
// )

onUnmounted(() => {
  // document.body.style.overflow = ''
})
</script>

<style scoped>
.wui-modal-overlay {
  @apply fixed inset-0 z-50 flex items-end sm:items-center justify-center
    bg-gray-200/75 dark:bg-gray-800/75
    px-4 sm:px-0;
}

.wui-modal-container {
  @apply relative bg-white dark:bg-gray-900
    flex flex-col 
    rounded-lg shadow-xl
    w-full sm:max-w-lg max-h-[90dvh]
    overflow-y-auto
    sm:my-8
    my-2
    ring-1 ring-gray-200 dark:ring-gray-800;
}

.wui-modal-enter-active,
.wui-modal-leave-active {
  transition: opacity 0.3s ease;
}

.wui-modal-enter-active .wui-modal-container,
.wui-modal-leave-active .wui-modal-container {
  transition: all 0.3s ease;
}

.wui-modal-enter-from,
.wui-modal-leave-to {
  opacity: 0;
}

.wui-modal-enter-from .wui-modal-container {
  transform: translateY(1rem) scale(0.95);
}

@media (min-width: 640px) {
  .wui-modal-enter-from .wui-modal-container {
    transform: translateY(0) scale(0.95);
  }
}

.wui-modal-leave-to .wui-modal-container {
  transform: translateY(1rem) scale(0.95);
}

@media (min-width: 640px) {
  .wui-modal-leave-to .wui-modal-container {
    transform: translateY(0) scale(0.95);
  }
}
</style>
