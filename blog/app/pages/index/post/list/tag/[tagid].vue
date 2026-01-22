<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200 dark:border-gray-700"
      v-if="data"
    >
      标签：#{{ data.data.tagname }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { getTagDetailApi } from '@/api/tag'
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
const tagid = route.params.tagid
const { data } = await getTagDetailApi({
  id: tagid
})
useSeoMeta({
  title: data.value.data.tagname,
  ogTitle: data.value.data.tagname,
  // twitter
  twitterTitle: data.value.data.tagname
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListTag',
    tagid: tagid,
    tagname: data.value.data.tagname
  })
})
</script>
