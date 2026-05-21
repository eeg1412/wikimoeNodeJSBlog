<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200 dark:border-gray-700"
      v-if="data"
    >
      {{ data.data.booktype?.name || '书籍' }}：{{ data.data.title }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { getBookDetailApi } from '@/api/book'
import { postLogCreateApi } from '@/api/log'
const route = useRoute()
// 如果page不是正整数，报错去404页面
const page = route.params.page
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: '页面不存在'
  })
  throw new Error('页面不存在')
}
const bookid = route.params.bookid
const { data } = await getBookDetailApi({
  id: bookid
})
useSeoMeta({
  title: data.value.data.title,
  ogTitle: data.value.data.title,
  // twitter
  twitterTitle: data.value.data.title
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListBook',
    bookid: bookid,
    bookname: data.value.data.title
  })
})
</script>
