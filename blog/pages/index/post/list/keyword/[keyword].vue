<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200"
    >
      搜索：{{ keyword }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'

const route = useRoute()
// 如果page不是正整数，报错去404页面
const page = route.params.page
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: '页面不存在',
  })
  throw new Error('页面不存在')
}
const keyword = route.params.keyword || ''
// 设置SEO
useSeoMeta({
  title: keyword,
  ogTitle: keyword,
  keywords: keyword,
  // twitter
  twitterTitle: keyword,
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListKeyword',
    keyword: keyword,
  })
})
</script>
