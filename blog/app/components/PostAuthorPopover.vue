<template>
  <WUIPopover
    v-model:open="isOpen"
    :popper="{ arrow: true, placement: 'bottom-start' }"
  >
    <button
      type="button"
      class="post-author-popover-trigger common-focus-visible-btn-outline hover:!text-primary-500"
      :class="triggerClass"
      :title="authorCard.nickname"
      @click.stop="togglePopover"
      @mousedown.stop
      @auxclick.stop
      @keydown.enter.stop.prevent="togglePopover"
      @keydown.space.stop.prevent="togglePopover"
    >
      <slot :author="authorCard" :isOpen="isOpen">
        {{ authorCard.nickname }}
      </slot>
    </button>
    <template #panel>
      <div class="post-author-popover-panel cursor-default" @click.stop>
        <div class="post-author-popover-cover">
          <img
            v-if="authorCover"
            :src="authorCover.filepath"
            :width="authorCover.width"
            :height="authorCover.height"
            :alt="authorCard.nickname"
            class="post-author-popover-cover-img"
          />
          <img
            v-else
            src="/img/mypage-banner.webp"
            width="880"
            height="350"
            alt="mypage-banner"
            class="post-author-popover-cover-img"
          />
        </div>
        <div class="post-author-popover-content">
          <div class="post-author-popover-head">
            <img
              :src="authorCard.photo"
              :alt="authorCard.nickname"
              class="post-author-popover-avatar"
              width="96"
              height="96"
            />
            <div class="post-author-popover-info">
              <div class="post-author-popover-name">
                {{ authorCard.nickname }}
              </div>
            </div>
          </div>
          <div class="post-author-popover-description">
            {{ authorCard.description || t('common.pageAbout.noDescription') }}
          </div>
        </div>
      </div>
    </template>
  </WUIPopover>
</template>

<script setup>
const props = defineProps({
  author: {
    type: Object,
    default: null
  },
  triggerClass: {
    type: [String, Array, Object],
    default: ''
  }
})

const { options } = useOptions()
const { isLocalizedRoute, languageCode, t } = useLang()
const isOpen = ref(false)

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

const defaultAuthor = computed(() => {
  return {
    nickname: options.value?.siteTitle || 'Wikimoe',
    photo: '/img/avatar/1.webp',
    description: '',
    cover: null
  }
})

const authorCard = computed(() => {
  const author = props.author
  if (!author || typeof author !== 'object') {
    return defaultAuthor.value
  }

  return {
    nickname: author.nickname || defaultAuthor.value.nickname,
    photo: author.photo || defaultAuthor.value.photo,
    description: author.description || '',
    cover: author.cover || null
  }
})

const authorCover = computed(() => {
  const cover = authorCard.value.cover
  if (!cover || typeof cover !== 'object' || !cover.filepath) {
    return null
  }

  return cover
})
</script>

<style scoped>
.post-author-popover-trigger {
  display: inline-flex;
  align-items: center;
  color: inherit;
  background: transparent;
  border: 0;
  padding: 0;
  line-height: inherit;
  text-align: left;
}

.post-author-popover-panel {
  @apply bg-white dark:bg-gray-900 shadow-lg;
  width: min(21rem, calc(100vw - 2rem));
  overflow: hidden;
  border-radius: 0.5rem;
}

.post-author-popover-cover {
  isolation: isolate;
  overflow: hidden;
}

.post-author-popover-cover-img {
  width: 100%;
  height: auto;
}

.post-author-popover-content {
  position: relative;
  padding: 0 1rem 1rem;
}

.post-author-popover-head {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.post-author-popover-avatar {
  @apply border-solid border-white bg-white dark:border-gray-900 dark:bg-gray-900;
  width: 6rem;
  height: 6rem;
  margin-top: -3rem;
  border-width: 4px;
  border-radius: 9999px;
}

.post-author-popover-info {
  flex: 1;
  min-width: 0;
  margin-top: 0.25rem;
}

.post-author-popover-name {
  @apply text-gray-900 dark:text-gray-100;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-top: 0.1rem;
}

.post-author-popover-description {
  @apply text-gray-600 dark:text-gray-400;
  margin-top: 0.35rem;
  font-size: 0.875rem;
  line-height: 1.65;
  line-clamp: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
