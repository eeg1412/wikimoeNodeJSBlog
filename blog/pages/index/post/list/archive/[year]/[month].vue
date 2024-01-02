<template>
  <div>
    <div
      class="ml20 mr20 mt10 mb10 bg-primary-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-full block text-center"
    >
      {{ title }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
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
