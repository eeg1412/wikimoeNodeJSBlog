<template>
  <div>
    <div v-if="postsData" class="post-list-body">
      <div
        v-for="(item, index) in postsData.list"
        :key="item._id"
        class="post-list-body-item"
      >
        <!-- 作者 时间 分类名 -->
        <div class="post-list-info-body">
          <span>{{ item.author?.nickname }}</span
          ><span class="tenten">·</span
          ><span class="cGray94">{{ item.date }}</span
          ><span class="tenten">·</span
          ><span class="cGray94">{{ item.sort?.sortname }}</span>
        </div>
        <!-- 简介/推文 -->
        <!-- tags -->
        <!-- 图片 -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getPostsApi } from '@/api/post'

definePageMeta({
  alias: '/',
  name: 'post-list',
})

const route = useRoute()
const page = route.params.page ? Number(route.params.page) : 1
console.log(page)

const { data: postsData } = await getPostsApi({
  page,
})

console.log(postsData)

onMounted(() => {
  console.log('mounted')
})
</script>
<style scoped>
img {
  max-width: 100%;
}
.post-list-body {
  padding: 15px;
}
</style>
