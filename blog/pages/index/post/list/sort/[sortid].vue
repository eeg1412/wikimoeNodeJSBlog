<template>
  <NuxtPage></NuxtPage>
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
