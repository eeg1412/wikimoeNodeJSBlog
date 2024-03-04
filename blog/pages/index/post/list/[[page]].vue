<template>
  <div>
    <PostList />
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'
definePageMeta({
  alias: ['/'],
  path: '/post/list/:page?/:type?',
  name: 'postList',
})
onMounted(() => {
  postLogCreateApi({
    action: 'postList',
  })
})
</script>
<style scoped></style>
