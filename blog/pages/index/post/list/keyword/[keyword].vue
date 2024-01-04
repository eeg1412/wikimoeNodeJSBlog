<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200"
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
  // twitter
  twitterTitle: keyword,
})
</script>
