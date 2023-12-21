<template>
  <div class="post-detail-body">
    <HtmlContent :content="postData.data.content" />
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getDetailApi } from '@/api/post'

definePageMeta({
  name: 'postDetail',
})

const route = useRoute()
const id = route.params.id
const [postDataResponse] = await Promise.all([
  getDetailApi({
    id,
  }),
])

const { data: postData } = postDataResponse
</script>
<style scoped>
.post-detail-body {
  position: relative;
  background: #fff;
  padding: 20px 25px 75px;
}
</style>
