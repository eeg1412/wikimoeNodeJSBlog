<template>
  <div class="post-reactions-body" v-if="isHydrated">
    <div class="flex flex-wrap items-center gap-1.5">
      <!-- 已有的反应气泡 -->
      <button
        v-for="reaction in sortedReactions"
        :key="reaction.emoji"
        class="reaction-bubble cursor-pointer select-none"
        :class="{
          'reaction-bubble-active': userEmoji === reaction.emoji
        }"
        @click="handleReactionClick(reaction.emoji)"
        :disabled="reactionLoading"
      >
        <span class="reaction-bubble-emoji">{{ reaction.emoji }}</span>
        <span class="reaction-bubble-count">{{ reaction.count }}</span>
      </button>
      <!-- 添加反应按钮 -->
      <WUIPopover
        :popper="{ placement: 'bottom-start', offsetDistance: 6 }"
        v-if="!userEmoji"
      >
        <button
          class="reaction-add-btn cursor-pointer select-none"
          :disabled="reactionLoading"
        >
          <WUIIcon name="i-heroicons-face-smile" class="w-4 h-4" />
        </button>
        <template #panel="{ close }">
          <div class="reaction-emoji-panel">
            <button
              v-for="emoji in emojiList"
              :key="emoji"
              class="reaction-emoji-item cursor-pointer select-none"
              @click="addReaction(emoji, close)"
              :disabled="reactionLoading"
            >
              {{ emoji }}
            </button>
          </div>
        </template>
      </WUIPopover>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  reactions: {
    type: Array,
    default: () => []
  },
  userEmoji: {
    type: String,
    default: null
  },
  userReactionVersion: {
    type: Number,
    default: undefined
  },
  emojiList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['react'])

const isHydrated = useIsHydrated()
const reactionLoading = computed(() => props.loading)

const sortedReactions = computed(() => {
  if (!props.reactions || props.reactions.length === 0) {
    return []
  }
  return [...props.reactions].sort((a, b) => b.count - a.count)
})

const handleReactionClick = (emoji) => {
  if (reactionLoading.value) return
  if (props.userEmoji === emoji) {
    return
  }
  emit('react', { emoji, __v: props.userReactionVersion })
}

const addReaction = (emoji, closeFn) => {
  if (reactionLoading.value) return
  closeFn()
  emit('react', { emoji, __v: props.userReactionVersion })
}

function useIsHydrated() {
  const isHydrated = ref(false)
  onMounted(() => {
    isHydrated.value = true
  })
  return isHydrated
}
</script>

<style scoped>
.post-reactions-body {
  @apply mt-2;
}
.reaction-bubble {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm
    bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
    border border-transparent transition-colors;
}
.reaction-bubble-active {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900/30;
}
.reaction-bubble-emoji {
  @apply text-base leading-none;
}
.reaction-bubble-count {
  @apply text-xs text-gray-600 dark:text-gray-400 leading-none;
}
.reaction-bubble-active .reaction-bubble-count {
  @apply text-primary-600 dark:text-primary-400;
}
.reaction-add-btn {
  @apply inline-flex items-center justify-center w-7 h-7 rounded-full
    bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
    text-gray-500 dark:text-gray-400 transition-colors;
}
.reaction-emoji-panel {
  @apply grid grid-cols-5 gap-1 p-2 bg-white dark:bg-gray-900 rounded-lg
    shadow-lg border border-gray-200 dark:border-gray-700 max-w-[220px];
}
.reaction-emoji-item {
  @apply flex items-center justify-center w-9 h-9 rounded-md text-xl
    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
}
</style>
