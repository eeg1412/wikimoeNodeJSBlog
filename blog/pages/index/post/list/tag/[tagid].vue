<template>
  <div>
    <div
      class="text-primary-400 pt-2 pb-2 block text-center border-solid border-b border-gray-200"
    >
      标签：#{{ data.data.tagname }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { getTagDetailApi } from '@/api/tag'
const route = useRoute()
const tagid = route.params.tagid
const { data } = await getTagDetailApi({
  id: tagid,
})
useSeoMeta({
  title: data.value.data.tagname,
  ogTitle: data.value.data.tagname,
})
</script>
