<template>
  <Teleport to="body">
    <Transition name="wui-modal">
      <div
        v-if="modelValue"
        class="wui-modal-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="wui-modal-container" @click.stop>
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
watch(
  () => props.modelValue,
  val => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.wui-modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center
    bg-gray-900/75 dark:bg-gray-950/75
    px-4;
}

.wui-modal-container {
  @apply relative bg-white dark:bg-gray-900
    rounded-lg shadow-xl
    w-full max-w-lg max-h-[90vh]
    overflow-y-auto
    ring-1 ring-gray-200 dark:ring-gray-800;
}

.wui-modal-enter-active,
.wui-modal-leave-active {
  transition: opacity 0.2s ease;
}

.wui-modal-enter-active .wui-modal-container,
.wui-modal-leave-active .wui-modal-container {
  transition: transform 0.2s ease;
}

.wui-modal-enter-from,
.wui-modal-leave-to {
  opacity: 0;
}

.wui-modal-enter-from .wui-modal-container {
  transform: scale(0.95);
}

.wui-modal-leave-to .wui-modal-container {
  transform: scale(0.95);
}
</style>
