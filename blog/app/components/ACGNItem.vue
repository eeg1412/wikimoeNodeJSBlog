<template>
  <div class="flex acgn-item-body">
    <div class="flex-shrink-0 relative">
      <div class="acgn-left-content">
        <div
          class="acgn-item-cover-body content-h-131 relative flex justify-center items-center border border-solid border-gray-200 rounded-md p-1 bg-white dark:bg-black/30"
        >
          <WikimoeImage
            class="max-image rounded item-cover common-focus-visible-btn-outline"
            :class="{ 'movie-cover-none': !item.cover }"
            :src="item.cover || '/img/nopic400-565.png'"
            :alt="item.title"
            :data-href="item.cover"
            :data-href-list="item.cover ? setDataHrefList(item.cover) : null"
            loading="lazy"
            fit="contain"
            :tabindex="item.cover ? '0' : '-1'"
            @keydown.enter.stop="e => e.target.click()"
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
            <WUIIcon name="i-heroicons-newspaper" class="align-middle mr-1" />
            相关文章
          </NuxtLink>
          <a
            href="javascript:;"
            class="inline-flex items-center text-primary mr-2"
            v-if="item.screenshotAlbum"
            @click="showAlbum(item.screenshotAlbum._id)"
          >
            <WUIIcon name="i-heroicons-photo" class="align-middle mr-1" />
            相关相册
          </a>
          <a
            :href="url.url"
            target="_blank"
            class="inline-flex items-center text-primary mr-2"
            v-for="(url, index) in item.urlList"
            :key="index"
          >
            <WUIIcon name="i-heroicons-link" class="align-middle mr-1" />
            {{ url.text }}
          </a>
        </div>

        <div class="acg-summary">
          <div v-if="item.summary">
            <div
              class="text-sm whitespace-pre-line text-gray-500 flex-grow dark:text-gray-300"
            >
              <span class="break-all">{{ displaySummary }}</span
              ><span class="inline-block" v-if="summaryTooLong">
                <button
                  @click="toggleSummary"
                  class="text-sm text-primary inline-flex items-center pl-1"
                >
                  {{ summaryExpanded ? '<收起>' : '<更多>' }}
                </button>
              </span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400">暂无内容</div>

          <div
            class="text-sm whitespace-pre-line text-gray-400 flex-grow"
            v-if="item.label?.length > 0"
          >
            标记：<WUIBadge
              v-for="(label, index) in item.label"
              :key="index"
              color="white"
              size="xs"
              class="mr-1 mt-1"
            >
              {{ label }}
            </WUIBadge>
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
  },
  enableSummaryToggle: {
    type: Boolean,
    default: false
  },
  summaryToggleThreshold: {
    type: Number,
    default: 160
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

// 简介更多/收起功能
const summaryExpanded = ref(false)
const summaryTooLong = computed(() => {
  const s = props.item?.summary || ''
  return props.enableSummaryToggle && s.length > props.summaryToggleThreshold
})
const displaySummary = computed(() => {
  const s = props.item?.summary || ''
  if (!props.enableSummaryToggle) return s
  if (summaryExpanded.value) return s
  if (s.length <= props.summaryToggleThreshold) return s
  return s.slice(0, props.summaryToggleThreshold) + '...'
})
const toggleSummary = () => {
  summaryExpanded.value = !summaryExpanded.value
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
