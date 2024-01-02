<template>
  <div>
    <div
      class="ml20 mr20 mt10 mb10 bg-primary-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-full block text-center"
    >
      搜索：{{ keyword }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
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
