<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200"
    >
      {{ title }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'

const route = useRoute()
const page = route.params.page
// 如果page不是正整数，报错去404页面
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: '页面不存在',
  })
  throw new Error('页面不存在')
}
const year = route.params.year
const month = route.params.month
const title = `归档${year}年${month}月`
// 设置SEO
useSeoMeta({
  title: title,
  ogTitle: title,
  // twitter
  twitterTitle: title,
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListArchive',
    title: title,
  })
})
</script>
