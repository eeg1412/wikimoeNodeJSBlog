<template>
  <div>
    <LazyPostList />
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'

definePageMeta({
  alias: ['/:code?'],
  name: 'postList'
})
onMounted(() => {
  postLogCreateApi({
    action: 'postList'
  })
})
</script>
<style scoped></style>
