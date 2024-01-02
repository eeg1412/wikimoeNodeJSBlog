<template>
  <div>
    <div
      class="text-primary-400 pt-2 pb-2 block text-center border-solid border-b border-gray-200"
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
