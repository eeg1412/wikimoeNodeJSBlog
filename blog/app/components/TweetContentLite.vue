<template>
  <div
    class="tweet-content-lite-item-body flex border border-solid cursor-pointer rounded-md overflow-hidden transition-border-color duration-500 bg-white dark:bg-gray-800/40"
  >
    <!-- 图片区域 -->
    <div class="tweet-content-lite-item-images">
      <img loading="lazy" class="w-full h-full object-cover" :src="image" />
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
// props
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const { options } = useOptions()

const coverImages = computed(() => {
  const coverImages = props.item?.coverImages || []
  return coverImages
})

const image = computed(() => {
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
  return imageList.length ? imageList[0] : options.value.siteDefaultCover
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

.tweet-content-lite-item-body:hover,
.tweet-content-lite-item-body:hover .tweet-content-lite-item-left {
  @apply border-primary-500;
}
</style>
