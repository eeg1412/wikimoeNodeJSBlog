<template>
  <div>
    <div
      class="ml20 mr20 mt10 mb10 bg-primary-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-full block text-center"
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
})
</script>
