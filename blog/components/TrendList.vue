<template>
  <div class="trend-list-body">
    <!-- 遍历trendList -->
    <!-- nuxt-link -->
    <nuxt-link
      :to="getLinkObj(item)"
      v-for="(item, index) in trendList"
      :key="index"
      class="trend-item-body flex border border-solid cursor-pointer my-3 rounded-md overflow-hidden transition duration-500"
    >
      <div
        class="flex-1 min-w-0 pr-4 pl-3 py-3 trend-item-left border-r border-solid transition duration-500"
      >
        <div class="text-sm text-gray-500 mb-1 flex items-center">
          <span class="font-medium text-gray-700 mr-1">{{ index + 1 }}.</span
          ><span>{{ getTrendCategory(item) }}</span>
        </div>
        <div
          class="line-clamp-2 text-gray-800 font-semibold text-sm break-words"
        >
          {{ getTrendTitle(item) }}
        </div>
      </div>

      <div
        class="w-14 flex flex-col items-center justify-center text-sm bg-white"
      >
        <div class="text-gray-800 text-xs">点击数</div>
        <div class="text-primary-600 text-base font-semibold">
          {{ formatNumber(item.count) }}
        </div>
      </div>
    </nuxt-link>
    <!-- 空列表 -->
    <!-- v-if="trendList.length === 0" -->
    <div class="text-center py-4 text-gray-500" v-if="trendList.length === 0">
      <!-- <div class="text-2xl mb-2">
        <UIcon name="i-heroicons-cube-transparent" class="align-middle mr-1" />
      </div> -->
      <div>暂无数据</div>
    </div>
  </div>
</template>
<script setup>
import { getTrendListApi } from '@/api/trend'

const { data: trendListData } = await getTrendListApi()
const trendList = ref(trendListData.value.list)

const getTrendDetail = (item, target) => {
  let detail = ''
  switch (target) {
    case 'tag':
      detail = item.tagDetail
      break
    case 'sort':
      detail = item.sortDetail
      break
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
    case 'tag':
      linkObj = {
        name: 'postListTag',
        params: { tagid: detail._id, page: 1 },
      }
      break
    case 'sort':
      linkObj = {
        name: 'postListSort',
        params: { sortid: detail.alias || detail._id, page: 1 },
      }
      break
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
    case 'tag':
      title = '#' + detail.tagname
      break
    case 'sort':
      title = detail.sortname
      break
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
  return title
}
const getTrendCategory = (item) => {
  let category = ''
  const target = item.target
  switch (target) {
    case 'tag':
      category = '标签'

      break
    // sort
    case 'sort':
      category = '分类'
      break
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
</script>
<style scoped>
.trend-item-body {
  border-color: #eee;
}
.trend-item-left {
  /* background-color: #fbfbfb; */
  border-color: #eee;
}
.trend-item-body:hover,
.trend-item-body:hover .trend-item-left {
  @apply border-primary-500;
}
/* .trend-item-body:hover .trend-item-left {
  @apply bg-primary-50;
} */
</style>
