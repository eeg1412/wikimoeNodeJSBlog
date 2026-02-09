<template>
  <Teleport to="body">
    <div class="wui-notifications" aria-live="assertive">
      <TransitionGroup name="wui-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="wui-toast"
          :class="toastColorClass(toast.color)"
        >
          <div class="wui-toast-content">
            <div class="h-5" :class="iconColorClass(toast.color)">
              <WUIIcon
                v-if="toast.icon"
                :name="toast.icon"
                class="wui-toast-icon"
              />
            </div>
            <div class="wui-toast-body">
              <p v-if="toast.title" class="wui-toast-title">
                {{ toast.title }}
              </p>
              <p v-if="toast.description" class="wui-toast-description">
                {{ toast.description }}
              </p>
              <div
                v-if="toast.actions && toast.actions.length"
                class="wui-toast-actions"
              >
                <button
                  v-for="(action, idx) in toast.actions"
                  :key="idx"
                  class="wui-toast-action-btn"
                  @click="onAction(action, toast.id)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            <button class="wui-toast-close" @click="remove(toast.id)">
              <WUIIcon name="i-heroicons-x-mark-20-solid" class="w-4 h-4" />
            </button>
          </div>
          <div
            v-if="toast.timeout > 0"
            class="wui-toast-progress"
            :class="progressColorClass(toast.color)"
            :style="{ animationDuration: `${toast.timeout}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useWToast } from '~/composables/useWToast'

const { toasts, remove } = useWToast()

function onAction(action, toastId) {
  if (action.click) action.click()
  remove(toastId)
}

function toastColorClass(color) {
  const map = {
    red: 'wui-toast-red',
    green: 'wui-toast-green',
    primary: 'wui-toast-primary'
  }
  return map[color] || 'wui-toast-primary'
}

function iconColorClass(color) {
  const map = {
    red: 'text-red-500',
    green: 'text-green-500',
    primary: 'text-primary-500'
  }
  return map[color] || 'text-primary-500'
}

function progressColorClass(color) {
  const map = {
    red: 'bg-red-500 dark:bg-red-400',
    green: 'bg-green-500 dark:bg-green-400',
    primary: 'bg-primary-500 dark:bg-primary-400'
  }
  return map[color] || 'bg-primary-500 dark:bg-primary-400'
}
</script>

<style scoped>
.wui-notifications {
  @apply fixed top-0 right-0 z-[100] flex flex-col items-end gap-2 p-4
    pointer-events-none max-w-sm w-full;
}

.wui-toast {
  @apply w-full bg-white dark:bg-gray-900
    rounded-lg shadow-lg
    ring-1 ring-gray-200 dark:ring-gray-800
    pointer-events-auto
    relative overflow-hidden;
}

.wui-toast-red {
  @apply ring-red-200 dark:ring-red-800/50;
}

.wui-toast-green {
  @apply ring-green-200 dark:ring-green-800/50;
}

.wui-toast-primary {
  @apply ring-primary-200 dark:ring-primary-800/50;
}

.wui-toast-content {
  @apply flex items-start gap-3 p-4;
}

.wui-toast-icon {
  @apply flex-shrink-0 w-5 h-5;
}

.wui-toast-body {
  @apply flex-1 min-w-0;
}

.wui-toast-title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.wui-toast-description {
  @apply mt-1 text-sm text-gray-500 dark:text-gray-400 min-h-5;
}

.wui-toast-actions {
  @apply mt-2 flex gap-2;
}

.wui-toast-action-btn {
  @apply text-sm font-medium text-primary-500 dark:text-primary-400
    hover:text-primary-600 dark:hover:text-primary-500
    cursor-pointer;
}

.wui-toast-close {
  @apply flex-shrink-0 text-gray-400 hover:text-gray-500
    dark:text-gray-500 dark:hover:text-gray-400
    cursor-pointer rounded-md h-5;
}

.wui-toast-progress {
  @apply absolute bottom-0 left-0 h-1;
  animation: notification-progress linear forwards;
}

@keyframes notification-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transition */
.wui-toast-enter-active {
  transition: all 0.3s ease;
}

.wui-toast-leave-active {
  transition: all 0.2s ease;
}

.wui-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.wui-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.wui-toast-move {
  transition: transform 0.3s ease;
}
</style>
