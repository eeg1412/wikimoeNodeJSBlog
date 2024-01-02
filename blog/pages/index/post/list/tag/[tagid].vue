<template>
  <div>
    <div
      class="ml20 mr20 mt10 mb10 bg-primary-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-full block text-center"
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
