<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200"
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
const tagid = route.params.tagid
const { data } = await getTagDetailApi({
  id: tagid,
})
useSeoMeta({
  title: data.value.data.tagname,
  ogTitle: data.value.data.tagname,
  // twitter
  twitterTitle: data.value.data.tagname,
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListTag',
    tagid: tagid,
    tagname: data.value.data.tagname,
  })
})
</script>
