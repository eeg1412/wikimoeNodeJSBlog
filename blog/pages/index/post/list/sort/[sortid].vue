<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200"
    >
      分类：{{ data.sortname }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { getSortDetailApi } from '@/api/sort'
const route = useRoute()
const sortid = route.params.sortid

const { data } = await getSortDetailApi({
  id: sortid,
})
useSeoMeta({
  title: data.value.sortname,
  ogTitle: data.value.sortname,
  description: data.value.description,
  // twitter
  twitterTitle: data.value.sortname,
  twitterDescription: data.value.description,
})
</script>
