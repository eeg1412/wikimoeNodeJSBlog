<template>
  <div class="mt-3">
    <div
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      {{ options.sitePostRandomSimilarTitle }}：
    </div>
    <div
      class="random-post-list-body mt-3"
      :class="{
        'is-odd': randomPostList.length % 2 !== 0
      }"
    >
      <!-- 遍历randomPostList -->
      <!-- nuxt-link -->
      <nuxt-link
        :to="getLinkObj(item)"
        v-for="(item, index) in randomPostList"
        :key="index"
        class="random-post-item-body flex border border-solid cursor-pointer rounded-md overflow-hidden transition duration-500"
        :class="`random-post-item-type-${item.type}`"
        target="_blank"
      >
        <div
          class="flex-1 min-w-0 pr-4 pl-3 py-2 random-post-item-left transition duration-500"
        >
          <img
            loading="lazy"
            class="random-post-item-left-image"
            :src="getBackgroundImage(item)"
          />
          <div
            class="text-sm text-gray-500 dark:text-gray-300 mb-1 flex items-center"
          >
            <span>{{ getRandomPostCategory(item) }}</span>
          </div>
          <div
            class="line-clamp-2 text-gray-800 dark:text-gray-200 font-semibold text-sm break-words random-post-item-title"
          >
            {{ getRandomPostTitle(item) }}
          </div>
          <!-- 时间 -->
          <div
            class="text-xs text-gray-600 dark:text-gray-300 mt-1"
            v-if="item.date"
          >
            发表于：{{ formatDate(item.date, 'yyyy-MM-dd hh:mm') }}
          </div>
        </div>
      </nuxt-link>
    </div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

// props
const props = defineProps({
  randomPostList: {
    type: Array,
    default: () => []
  }
})

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const getLinkObj = item => {
  let linkObj = {}
  const type = item.type
  const detail = item
  switch (type) {
    case 2:
    case 1:
      linkObj = {
        name: 'postDetail',
        params: { id: detail.alias || detail._id }
      }
      break
    case 3:
      linkObj = {
        name: 'pageDetail',
        params: { id: detail.alias || detail._id }
      }

      break
    default:
      break
  }
  return linkObj
}
const getRandomPostTitle = item => {
  let title = ''
  const type = item.type
  const detail = item
  switch (type) {
    case 2:
      title = detail.excerpt
      break
    case 1:
    case 3:
      title = detail.title
      break
    default:
      break
  }
  return title
}
const getRandomPostCategory = item => {
  let category = ''
  const type = item.type
  switch (type) {
    // tweet
    case 2:
      category = '推文'
      break
    // blog
    case 1:
      category = '博文'
      break
    // page
    case 3:
      category = '页面'
      break

    default:
      break
  }
  return category
}
const getBackgroundImage = item => {
  let backgroundImage = options.value.siteDefaultCover
  const detail = item
  if (detail.coverImage) {
    const mimetype = detail.coverImage.mimetype
    if (detail.coverImage.thumfor) {
      backgroundImage = detail.coverImage.thumfor
    } else if (mimetype.includes('image')) {
      backgroundImage = detail.coverImage.filepath
    }
  }
  return `${backgroundImage}`
}
</script>
<style scoped>
.random-post-list-body {
  /* grid 布局 2列 */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.random-post-list-body.is-odd .random-post-item-body:last-child {
  grid-column: span 2;
}

/* 单列 */
/* 0-640 */
/* 769 - 950 */
/* 1025 - 1240 */
@media (max-width: 640px),
  (min-width: 769px) and (max-width: 950px),
  (min-width: 1025px) and (max-width: 1240px) {
  .random-post-list-body {
    grid-template-columns: 1fr;
  }
  .random-post-list-body.is-odd .random-post-item-body:last-child {
    grid-column: span 1;
  }
}

.random-post-item-body {
  border-color: #e2e2e2;
  height: 6.5rem;
}
.random-post-item-left {
  /* background-color: #fbfbfb; */
  position: relative;
  z-index: 1;
  border-color: #e2e2e2;
}
.random-post-item-title {
  height: 2.68rem;
}
.random-post-item-left-image {
  position: absolute;
  display: block;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
  opacity: 0.1;
  @apply bg-primary-100;
}
.random-post-item-body:hover,
.random-post-item-body:hover .random-post-item-left {
  @apply border-primary-500;
}
</style>
