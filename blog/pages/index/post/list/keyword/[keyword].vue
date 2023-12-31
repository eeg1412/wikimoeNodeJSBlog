<template>
  <NuxtPage></NuxtPage>
</template>
<script setup>
const route = useRoute()
const keyword = route.params.keyword || ''
// 设置SEO
useSeoMeta({
  title: keyword,
  ogTitle: keyword,
  keywords: keyword,
})
</script>
