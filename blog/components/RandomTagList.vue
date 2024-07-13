<template>
  <div class="random-tag-list-body mt-3">
    <!-- 遍历randomTagList -->
    <!-- nuxt-link -->
    <nuxt-link
      :to="getLinkObj(item)"
      v-for="(item, index) in randomTagList"
      :key="index"
      class="random-tag-item-body border border-primary-400 text-primary-400 rounded inline-block bg-white hover:bg-primary-400 hover:text-white transition-colors duration-200 break-words"
      >{{ item.tagname }}</nuxt-link
    >
    <!-- 空列表 -->
    <div
      class="text-center py-4 text-gray-500"
      v-if="randomTagList.length === 0"
    >
      <div>暂无数据</div>
    </div>
  </div>
</template>
<script setup>
import { getRandomTagListApi } from '@/api/tag'

const { data: randomTagListData } = await getRandomTagListApi()
const randomTagList = ref(randomTagListData.value.list)

const getLinkObj = (item) => {
  return {
    name: 'postListTag',
    params: {
      tagid: item._id,
      page: 1,
    },
  }
}
</script>
<style scoped>
.random-tag-list-body {
  margin-left: -0.2rem;
  margin-right: -0.2rem;
}
.random-tag-item-body {
  font-size: 14px;
  margin: 0.2rem;
  padding: 0.1rem 0.5rem;
}
</style>
