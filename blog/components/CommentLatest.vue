<template>
  <div>
    <div
      v-for="(item, index) in commentLatest"
      :key="item._id"
      class="comment-latest-item-body"
    >
      <!-- 左边头像 -->
      <div class="comment-latest-item-avatar-body">
        <Avatar :avatar="item.avatar" :alt="item.nickname" />
      </div>
      <!-- 右边内容 -->
      <div class="comment-latest-item-content-body">
        <!-- 昵称 -->
        <div class="comment-latest-item-nickname-body fb">
          {{ item.nickname }}
        </div>
        <!-- 评论内容 -->
        <div class="comment-latest-item-comment-body">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { getCommentLatestApi } from '@/api/comment'

const props = defineProps({})

const { data: commentLatest } = await getCommentLatestApi()
</script>
<style scoped>
.comment-latest-item-body {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  /* 顶部对齐 */
  align-items: flex-start;
}
.comment-latest-item-avatar-body {
  margin-right: 10px;
}
.comment-latest-item-content-body {
  width: calc(100% - 60px);
}
.comment-latest-item-nickname-body {
  /* 单行省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.comment-latest-item-comment-body {
  word-break: break-all;
}
</style>
