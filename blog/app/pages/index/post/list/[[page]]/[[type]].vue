<template>
  <div>
    <LazyPostList />
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'
definePageMeta({
  alias: ['/'],
  name: 'postList'
})
onMounted(() => {
  postLogCreateApi({
    action: 'postList'
  })
})
</script>
<style scoped></style>
