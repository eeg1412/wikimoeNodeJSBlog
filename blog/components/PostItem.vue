<template>
  <div class="post-list-blog-panel group">
    <div class="post-list-blog-cover-body">
      <WikimoeImage
        class="post-list-blog-cover-img border-t border-l border-r border-gray-200 border-solid group-hover:border-primary-300"
        :src="post.coverImages[0].thumfor || post.coverImages[0].filepath"
        :alt="post.coverImages[0].filename"
        :width="post.coverImages[0].thumWidth || post.coverImages[0].width"
        :height="post.coverImages[0].thumHeight || post.coverImages[0].height"
        v-if="post.coverImages[0]"
      />
      <!-- 默认封面图 defaultCover -->
      <WikimoeImage
        class="post-list-blog-cover-img border-t border-l border-r border-gray-200 border-solid group-hover:border-primary-300"
        :src="defaultCover"
        :alt="post.title"
        :width="1344"
        :height="648"
        v-else
      />
    </div>
    <!-- title -->
    <div
      class="post-list-title-body border border-gray-200 border-solid group-hover:border-primary-300 bg-white"
    >
      <div class="group-hover:text-primary-500">
        {{ post.title || '暂无标题' }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const defaultCover = options.value.siteDefaultCover || ''
</script>
<style scoped>
.post-list-blog-panel {
  margin-bottom: 12px;
}
.post-list-blog-cover-img {
  border-radius: 0.75rem 0.75rem 0px 0px;
}
.post-list-title-body {
  border-radius: 0px 0px 0.75rem 0.75rem;
  padding: 0.6rem 1rem;
  box-sizing: border-box;
  font-size: 15px;
}
</style>
