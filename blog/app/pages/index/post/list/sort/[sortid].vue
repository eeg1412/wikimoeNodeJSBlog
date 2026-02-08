<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200 dark:border-gray-700"
      v-if="data"
    >
      分类：{{ data.sortname }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { getSortDetailApi } from '@/api/sort'
import { postLogCreateApi } from '@/api/log'

const route = useRoute()
// 如果page不是正整数，报错去404页面
const page = route.params.page
if (!/^\d+$/.test(page)) {
  showError({
    status: 404,
    message: '页面不存在'
  })
  throw new Error('页面不存在')
}
const sortid = route.params.sortid

const { data } = await getSortDetailApi({
  id: sortid
})

let description = data.value.description
if (description && typeof description === 'string') {
  // 将换行符替换为空格
  description = description.replace(/\r?\n/g, ' ')
}
useSeoMeta({
  title: data.value.sortname,
  ogTitle: data.value.sortname,
  description: description,
  // og
  ogDescription: description,
  // twitter
  twitterTitle: data.value.sortname,
  twitterDescription: description
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListSort',
    sortid: data.value._id,
    sortname: data.value.sortname
  })
})
</script>
