<template>
  <div>
    <h1>post list Page</h1>
    <p>This is page {{ page }}</p>
    <!-- 跳转下一页 -->
    <nuxt-link :to="`/post/list/${page + 1}`">Next page</nuxt-link>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'

definePageMeta({
  alias: '/',
  name: 'post-list',
})

const route = useRoute()
const page = route.params.page ? Number(route.params.page) : 1
console.log(page)
console.log(route.name)
onMounted(() => {
  console.log('mounted')
})
</script>
