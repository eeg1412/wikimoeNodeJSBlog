<template>
  <div class="acgn-item-body">
    <div class="flex">
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
          <Rating :rating="item.rating" />
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
            v-if="
              item.urlList.length > 0 ||
              item.screenshotAlbum ||
              item.postLinkOpen
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
              相关截图
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
    <ACGNRatingList :id="item._id" :type="props.type" />
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
</style>
