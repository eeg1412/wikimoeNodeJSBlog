<template>
  <div>
    <LazyBanner />
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
const { getCurrentUrl } = usePostSeo()
useSeoMeta({
  ogUrl: getCurrentUrl()
})
</script>
