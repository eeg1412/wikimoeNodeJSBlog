<template>
  <NuxtPage></NuxtPage>
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
