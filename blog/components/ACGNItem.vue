<template>
  <div class="flex acgn-item-body">
    <div class="flex-shrink-0 relative">
      <div class="acgn-left-content">
        <div
          class="acgn-item-cover-body content-h-131 relative flex justify-center items-center border border-solid border-gray-200 rounded-md p-1"
        >
          <WikimoeImage
            class="max-image rounded item-cover"
            :class="{ 'movie-cover-none': !item.cover }"
            :src="item.cover || '/img/nopic400-565.png'"
            :alt="item.title"
            :data-href="item.cover"
            :data-href-list="item.cover ? setDataHrefList(item.cover) : null"
            loading="lazy"
            fit="contain"
          />
        </div>
        <Rating :rating="item.rating" />
      </div>
    </div>
    <div class="acgn-right-content">
      <div class="w-full flex flex-col">
        <div class="font-bold mb-1 flex-shrink-0">
          <span
            class="acgn-items-platform-block"
            :style="{
              backgroundColor: badge.color
            }"
            v-if="badge"
            >{{ badge.name }}</span
          >{{ item.title }}
        </div>
        <!-- 链接 -->
        <slot name="options"></slot>
        <div
          class="text-sm mb-1 text-gray-500 flex-shrink-0"
          v-if="item.urlList.length > 0 || item.screenshotAlbum"
        >
          <a
            :href="url.url"
            target="_blank"
            class="inline-flex items-center text-primary mr-2"
            v-for="(url, index) in item.urlList"
            :key="index"
          >
            <UIcon name="i-heroicons-link" class="align-middle mr-1" />
            {{ url.text }}
          </a>
          <a
            href="javascript:;"
            class="inline-flex items-center text-primary mr-2"
            v-if="item.screenshotAlbum"
            @click="showAlbum(item.screenshotAlbum._id)"
          >
            <UIcon name="i-heroicons-photo" class="align-middle mr-1" />
            相关截图
          </a>
        </div>

        <div class="acg-summary">
          <!-- prettier-ignore -->
          <div class="text-sm whitespace-pre-line text-gray-500 flex-grow dark:text-gray-300" v-if="item.summary">{{ item.summary }}</div>
          <div v-else class="text-sm text-gray-400">暂无内容</div>

          <div
            class="text-sm whitespace-pre-line text-gray-400 flex-grow"
            v-if="item.label?.length > 0"
          >
            标记：<span v-for="(label, index) in item.label" :key="index"
              ><span>{{ label }}</span
              ><span v-if="index !== item.label.length - 1">、</span></span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <ClientOnly>
    <AlbumPhotoSwipe ref="AlbumPhotoSwipeRef" :albumId="activeAlbumId" />
  </ClientOnly>
</template>
<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  badge: {
    type: Object,
    default: null
  }
})

const setDataHrefList = cover => {
  return [
    {
      filepath: cover
    }
  ]
}

// 相册
const activeAlbumId = ref('')
const AlbumPhotoSwipeRef = ref(null)

const showAlbum = id => {
  activeAlbumId.value = id
  nextTick(() => {
    AlbumPhotoSwipeRef.value.open()
  })
}
</script>
<style scoped>
/* .acgn-item-cover-body {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 0;
  padding-bottom: 0;
} */
.acgn-left-content {
  width: 100px;
}
.acgn-items-platform-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
  display: inline-block;
  line-height: 18px;
}
</style>
