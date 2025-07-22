<template>
  <div
    class="tweet-content-lite-item-body flex border border-solid cursor-pointer rounded-md overflow-hidden transition-border-color duration-500 bg-white dark:bg-gray-800/40"
  >
    <!-- 图片区域 -->
    <div class="tweet-content-lite-item-images" v-if="images.length > 0">
      <!-- 1张图片 -->
      <div v-if="images.length === 1" class="w-full h-full">
        <img
          loading="lazy"
          class="w-full h-full object-cover"
          :src="images[0]"
        />
      </div>

      <!-- 2张图片 -->
      <div v-else-if="images.length === 2" class="flex w-full h-full">
        <img
          v-for="(image, index) in images"
          :key="index"
          loading="lazy"
          class="flex-1 h-full object-cover"
          :class="{ 'border-r border-gray-200': index === 0 }"
          :src="image"
        />
      </div>

      <!-- 3张图片 -->
      <div v-else-if="images.length === 3" class="flex w-full h-full">
        <img
          loading="lazy"
          class="flex-1 h-full object-cover border-r border-gray-200"
          :src="images[0]"
        />
        <div class="flex-1 flex flex-col">
          <img
            loading="lazy"
            class="flex-1 object-cover border-b border-gray-200"
            :src="images[1]"
          />
          <img loading="lazy" class="flex-1 object-cover" :src="images[2]" />
        </div>
      </div>

      <!-- 4张或更多图片 -->
      <div v-else class="grid grid-cols-2 grid-rows-2 w-full h-full gap-1px">
        <img
          v-for="(image, index) in images.slice(0, 3)"
          :key="index"
          loading="lazy"
          class="w-full h-full object-cover"
          :src="image"
        />
        <div class="relative w-full h-full">
          <img
            loading="lazy"
            class="w-full h-full object-cover"
            :src="images[3]"
          />
          <div
            v-if="images.length > 4"
            class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold"
          >
            +{{ images.length - 4 }}
          </div>
        </div>
      </div>
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
  display: block;
  width: 6.5rem;
  height: 100%;
}

.tweet-content-lite-item-body:hover,
.tweet-content-lite-item-body:hover .tweet-content-lite-item-left {
  @apply border-primary-500;
}
</style>
