<template>
  <div>
    <div
      class="text-primary-400 pt-2 pb-2 block text-center border-solid border-b border-gray-200"
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
