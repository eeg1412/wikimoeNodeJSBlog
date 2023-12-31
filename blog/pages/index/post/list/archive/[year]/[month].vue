<template>
  <NuxtPage></NuxtPage>
</template>
<script setup>
const route = useRoute()
const year = route.params.year
const month = route.params.month
const title = `归档${year}年${month}月`
// 设置SEO
useSeoMeta({
  title: title,
  ogTitle: title,
})
</script>
