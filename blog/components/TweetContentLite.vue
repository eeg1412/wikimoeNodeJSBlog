<template>
  <div
    class="tweet-content-lite-item-body flex border border-solid cursor-pointer rounded-md overflow-hidden transition-border-color duration-500 bg-white dark:bg-gray-800/40"
  >
    <!-- 图片区域 -->
    <div
      class="tweet-content-lite-item-images"
      v-if="images.length > 0"
      :class="gridClass"
    >
      <template v-for="(image, index) in displayImages" :key="index">
        <div
          class="tweet-content-lite-image-item relative w-full h-full overflow-hidden"
        >
          <img loading="lazy" class="w-full h-full object-cover" :src="image" />
          <!-- 显示更多图片数量 -->
          <div
            v-if="index === 3 && images.length > 4"
            class="tweet-content-lite-more-count absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold"
          >
            +{{ images.length - 4 }}
          </div>
        </div>
      </template>
    </div>

    <!-- 默认图片 -->
    <div v-else class="tweet-content-lite-item-images">
      <img
        loading="lazy"
        class="w-full h-full object-cover"
        :src="options.siteDefaultCover"
      />
    </div>

    <div
      class="flex-1 min-w-0 pr-4 pl-3 py-2 tweet-content-lite-item-left transition duration-500"
    >
      <div
        class="line-clamp-3 text-gray-800 dark:text-gray-200 font-semibold text-sm break-words tweet-content-lite-item-title"
      >
        {{ item.excerpt || '推文' }}
      </div>
      <!-- 时间 -->
      <div
        class="text-xs text-gray-600 dark:text-gray-300 mt-1"
        v-if="item.date"
      >
        发表于：{{ formatDate(item.date, 'yyyy-MM-dd hh:mm') }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

// props
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const coverImages = computed(() => {
  const coverImages = props.item?.coverImages || []
  return coverImages
})

const images = computed(() => {
  const imageList = []
  if (coverImages.value.length > 0) {
    coverImages.value.forEach(coverImage => {
      const mimetype = coverImage.mimetype
      if (mimetype.includes('image')) {
        if (coverImage.thumfor) {
          imageList.push(coverImage.thumfor)
        } else {
          imageList.push(coverImage.filepath)
        }
      } else if (coverImage.thumfor) {
        // 如果是视频，使用缩略图
        imageList.push(coverImage.thumfor)
      }
    })
  }
  return imageList
})

// 获取 grid 布局的 CSS 类
const gridClass = computed(() => {
  const count = images.value.length
  if (count === 1) return 'tweet-content-lite-grid-1'
  if (count === 2) return 'tweet-content-lite-grid-2'
  if (count === 3) return 'tweet-content-lite-grid-3'
  return 'tweet-content-lite-grid-4'
})

// 获取要显示的图片（最多4张）
const displayImages = computed(() => {
  return images.value.slice(0, 4)
})
</script>
<style scoped>
.tweet-content-lite-item-body {
  @apply border-gray-200;
  height: 6.5rem;
  isolation: isolate;
}
.tweet-content-lite-item-left {
  position: relative;
  z-index: 1;
  border-color: #e2e2e2;
  /* flex布局 上下两端对齐 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tweet-content-lite-item-images {
  display: grid;
  gap: 1px;
  width: 6.5rem;
  height: 100%;
}

.tweet-content-lite-image-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tweet-content-lite-more-count {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

/* Grid 布局类 */
.tweet-content-lite-grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.tweet-content-lite-grid-2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.tweet-content-lite-grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.tweet-content-lite-grid-3 .tweet-content-lite-image-item:nth-child(1) {
  grid-row: span 2;
}

.tweet-content-lite-grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.tweet-content-lite-item-body:hover,
.tweet-content-lite-item-body:hover .tweet-content-lite-item-left {
  @apply border-primary-500;
}
</style>
