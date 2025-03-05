<template>
  <div class="trend-list-body mt-3">
    <!-- 遍历trendPostList -->
    <!-- nuxt-link -->
    <nuxt-link
      :to="getLinkObj(item)"
      v-for="(item, index) in trendPostList"
      :key="index"
      class="trend-item-body flex border border-solid cursor-pointer my-2 rounded-md overflow-hidden transition duration-500"
      :class="`trend-item-type-${item.target}`"
    >
      <div
        class="flex-1 min-w-0 pr-4 pl-3 py-2 trend-item-left border-r border-solid transition duration-500"
      >
        <div
          class="trend-item-left-image"
          :style="{
            backgroundImage: getBackgroundImage(item),
          }"
        ></div>
        <div
          class="text-sm text-gray-500 dark:text-gray-300 mb-1 flex items-center"
        >
          <span class="font-medium text-gray-700 dark:text-gray-300">{{
            index + 1
          }}</span
          ><span class="tenten"></span><span>{{ getTrendCategory(item) }}</span>
        </div>
        <div
          class="line-clamp-2 text-gray-800 dark:text-gray-200 font-semibold text-sm break-words trend-item-title"
        >
          {{ getTrendTitle(item) }}
        </div>
      </div>

      <div
        class="trend-right-hot-body px-1 flex flex-col items-center justify-center text-sm bg-white dark:bg-gray-800/40"
      >
        <div class="text-gray-800 text-xs dark:text-gray-200">热度</div>
        <div class="text-primary-600 text-base font-semibold">
          {{ formatNumber(item.hot) }}
        </div>
      </div>
    </nuxt-link>
    <!-- 空列表 -->
    <!-- v-if="trendPostList.length === 0" -->
    <div
      class="text-center py-4 text-gray-500"
      v-if="trendPostList.length === 0"
    >
      <!-- <div class="text-2xl mb-2">
        <UIcon name="i-heroicons-cube-transparent" class="align-middle mr-1" />
      </div> -->
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getTrendPostListApi } from '@/api/trend'
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const { data: trendPostListData } = await getTrendPostListApi()
const trendPostList = ref(trendPostListData.value.list)

const getTrendDetail = (item, target) => {
  let detail = ''
  switch (target) {
    case 'tweet':
    case 'blog':
    case 'page':
      detail = item.postDetail
      break
    default:
      break
  }
  return detail
}
const getLinkObj = (item) => {
  let linkObj = {}
  const target = item.target
  const detail = getTrendDetail(item, target)
  switch (target) {
    case 'tweet':
    case 'blog':
      linkObj = {
        name: 'postDetail',
        params: { id: detail.alias || detail._id },
      }
      break
    case 'page':
      linkObj = {
        name: 'pageDetail',
        params: { id: detail.alias || detail._id },
      }

      break
    default:
      break
  }
  return linkObj
}
const getTrendTitle = (item) => {
  let title = ''
  const target = item.target
  const detail = getTrendDetail(item, target)
  switch (target) {
    case 'tweet':
      title = detail.excerpt
      break
    case 'blog':
    case 'page':
      title = detail.title
      break
    default:
      break
  }
  if (!title) {
    title = '暂无标题或内容'
  }
  return title
}
const getTrendCategory = (item) => {
  let category = ''
  const target = item.target
  switch (target) {
    // tweet
    case 'tweet':
      category = '推文'
      break
    // blog
    case 'blog':
      category = '博文'
      break
    // page
    case 'page':
      category = '页面'
      break

    default:
      break
  }
  return category
}
const getBackgroundImage = (item) => {
  let backgroundImage = options.value.siteUrl + options.value.siteDefaultCover
  const target = item.target
  const detail = getTrendDetail(item, target)
  if (detail.coverImage) {
    const mimetype = detail.coverImage.mimetype
    if (detail.coverImage.thumfor) {
      backgroundImage = detail.coverImage.thumfor
    } else if (mimetype.includes('image')) {
      backgroundImage = detail.coverImage.filepath
    }
  }
  return `url(${backgroundImage})`
}
</script>
<style scoped>
.trend-item-body {
  border-color: #e2e2e2;
}
.trend-item-left {
  /* background-color: #fbfbfb; */
  position: relative;
  z-index: 1;
  border-color: #e2e2e2;
}
.trend-item-left-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0.1;
  @apply bg-primary-100;
}
.trend-item-body:hover,
.trend-item-body:hover .trend-item-left {
  @apply border-primary-500;
}
.trend-right-hot-body {
  min-width: 4.25rem;
}
.trend-item-title {
  height: 2.68rem;
}
/* .trend-item-body:hover .trend-item-left {
  @apply bg-primary-50;
} */
</style>
