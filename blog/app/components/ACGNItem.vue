<template>
  <div class="flex acgn-item-body">
    <div class="flex-shrink-0 relative">
      <div class="acgn-left-content">
        <div
          class="acgn-item-cover-body content-h-131 relative flex justify-center items-center border border-solid border-gray-200 rounded-md p-1 bg-white dark:bg-black/30"
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
        <!-- <div class="text-xs text-gray-500 font-medium">本站评分</div> -->
        <Rating :rating="item.rating" />
        <!-- 好评中评差评按钮 -->
        <!-- <div
          class="text-xs text-gray-500 font-medium border-t border-gray-200 pt-1 mt-1"
        >
          大众评价
        </div> -->
        <div
          class="border border-solid border-gray-200 dark:border-gray-700 dark:bg-black/30 rounded p-1 mt-2"
        >
          <div class="acgn-rating-buttons flex flex-col space-y-0">
            <button
              class="acgn-rating-button flex items-center cursor-pointer bg-transparent border-none py-0.5 px-1"
            >
              <UIcon
                name="i-heroicons-hand-thumb-up"
                class="w-4 h-4 text-green-500 text-xs flex-shrink-0"
              />
              <div
                class="acgn-progress-bar bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex-1 relative ml-1 overflow-hidden"
              >
                <div
                  class="acgn-progress-fill bg-green-500/80 h-full"
                  style="width: 58.8%"
                ></div>
                <span
                  class="acgn-progress-text text-xs text-gray-700 dark:text-gray-300 font-bold"
                  >{{ formatNumber(10054654) }}</span
                >
              </div>
            </button>
            <button
              class="acgn-rating-button flex items-center cursor-pointer bg-transparent border-none py-0.5 px-1"
            >
              <UIcon
                name="i-heroicons-minus"
                class="w-4 h-4 text-yellow-500 text-xs flex-shrink-0"
              />
              <div
                class="acgn-progress-bar bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex-1 relative ml-1 overflow-hidden"
              >
                <div
                  class="acgn-progress-fill bg-yellow-500/80 h-full"
                  style="width: 29.4%"
                ></div>
                <span
                  class="acgn-progress-text text-xs text-gray-700 dark:text-gray-300 font-bold"
                  >{{ formatNumber(1005400654) }}</span
                >
              </div>
            </button>
            <button
              class="acgn-rating-button flex items-center cursor-pointer bg-transparent border-none py-0.5 px-1"
            >
              <UIcon
                name="i-heroicons-hand-thumb-down"
                class="w-4 h-4 text-red-500 text-xs flex-shrink-0"
              />
              <div
                class="acgn-progress-bar bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex-1 relative ml-1 overflow-hidden"
              >
                <div
                  class="acgn-progress-fill bg-red-500/80 h-full"
                  style="width: 11.8%"
                ></div>
                <span
                  class="acgn-progress-text text-xs text-gray-700 dark:text-gray-300 font-bold"
                  >{{ formatNumber(20) }}</span
                >
              </div>
            </button>
          </div>
        </div>
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
          v-if="
            item.urlList.length > 0 || item.screenshotAlbum || item.postLinkOpen
          "
        >
          <!-- postLinkOpen 相关文章链接 nuxt link -->
          <NuxtLink
            v-if="item.postLinkOpen"
            class="inline-flex items-center text-primary mr-2"
            target="_blank"
            :to="{
              name: postLinkName,
              params: {
                ...postLinkParams,
                page: 1
              }
            }"
          >
            <UIcon name="i-heroicons-newspaper" class="align-middle mr-1" />
            相关文章
          </NuxtLink>
          <a
            href="javascript:;"
            class="inline-flex items-center text-primary mr-2"
            v-if="item.screenshotAlbum"
            @click="showAlbum(item.screenshotAlbum._id)"
          >
            <UIcon name="i-heroicons-photo" class="align-middle mr-1" />
            相关相册
          </a>
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
        </div>

        <div class="acg-summary">
          <!-- prettier-ignore -->
          <div class="text-sm whitespace-pre-line text-gray-500 flex-grow dark:text-gray-300" v-if="item.summary">{{ item.summary }}</div>
          <div v-else class="text-sm text-gray-400">暂无内容</div>

          <div
            class="text-sm whitespace-pre-line text-gray-400 flex-grow"
            v-if="item.label?.length > 0"
          >
            标记：<UBadge
              v-for="(label, index) in item.label"
              :key="index"
              color="white"
              size="xs"
              :ui="{
                color: {
                  white: {
                    solid:
                      'ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-500 dark:text-white bg-white dark:text-gray-300'
                  }
                }
              }"
              class="mr-1 mt-1"
            >
              {{ label }}
            </UBadge>
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
  },
  type: {
    type: String,
    default: ''
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

// postLinkName
const postLinkName = computed(() => {
  switch (props.type) {
    case 'game':
      return 'postListGame'
    case 'movie':
      return 'postListMovie'
    case 'book':
      return 'postListBook'
    case 'bangumi':
      return 'postListBangumi'
    default:
      return ''
  }
})
const postLinkParams = computed(() => {
  switch (props.type) {
    case 'game':
      return { gameid: props.item._id }
    case 'movie':
      return { movieid: props.item._id }
    case 'book':
      return { bookid: props.item._id }
    case 'bangumi':
      return { bangumiid: props.item._id }
    default:
      return {}
  }
})
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
.acgn-progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  width: 100%;
}
.acgn-rating-button {
  @apply transition-colors duration-200;
}
.acgn-rating-button:hover {
  @apply bg-primary/20 rounded;
}
</style>
