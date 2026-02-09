<template>
  <div>
    <div
      v-for="(item, index) in commentLatest"
      :key="item._id"
      class="comment-latest-item-body pointer"
      @click="e => goPostDetail(e, item)"
      @click.middle="e => goPostDetail(e, item, true)"
      @mousedown="preventDefaultMiddleClick"
    >
      <!-- 左边头像 -->
      <div class="comment-latest-item-avatar-body">
        <Avatar :avatar="item.avatar" :alt="item.nickname" />
      </div>
      <!-- 右边内容 -->
      <div class="comment-latest-item-content-body">
        <!-- 昵称 -->
        <div class="comment-latest-item-nickname-body fb">
          <span class="pr-1">{{ item.nickname }}</span
          ><WUIBadge size="xs" v-if="item.isAdmin">管理员</WUIBadge>
        </div>
        <div class="comment-latest-item-date">
          <ClientOnly
            ><span :title="formatDate(item.date, 'yyyy-MM-dd hh:mm:ss')">{{
              fromNow(item.date, 'yyyy-MM-dd hh:mm')
            }}</span
            ><template #fallback>{{
              formatDate(item.date, 'yyyy-MM-dd hh:mm')
            }}</template>
          </ClientOnly>
        </div>
        <!-- 评论内容 -->
        <div class="comment-latest-item-comment-body line-clamp-2">
          {{ item.content }}
        </div>
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="commentLatest.length === 0"
    >
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getCommentLatestApi } from '@/api/comment'

const props = defineProps({})
const router = useRouter()

const { data: commentLatest } = await getCommentLatestApi()

const goPostDetail = (e, item, middle) => {
  // 如果是点击了链接，就不跳转
  if (e.target.tagName === 'A') {
    return
  }

  let id = item.post._id
  const alias = item.post.alias
  const postType = item.post.type
  if (alias) {
    id = alias
  }
  let routeName = 'postDetail'
  if (postType === 3) {
    routeName = 'pageDetail'
  }
  // 当前path和点击的path一样，就不跳转
  // resolveUrl
  const url = router.resolve({
    name: routeName,
    params: { id },
    hash: `#comment-${item._id}`
  }).href
  const newTabOpen = () => {
    window.open(url, '_blank')
  }
  // 如果middle为true，就在新标签页打开
  if (middle) {
    newTabOpen()
  } else {
    if (
      router.currentRoute.value.name === routeName &&
      router.currentRoute.value.params?.id === id
    ) {
      newTabOpen()
      return
    }
    router.push({
      name: routeName,
      params: {
        id: id
      },
      hash: `#comment-${item._id}`
    })
  }
}
const preventDefaultMiddleClick = e => {
  console.log(e.button, e.target.tagName)
  if (e.button === 1 && e.target.tagName !== 'A') {
    console.log('preventDefault middle click')
    e.preventDefault()
  }
}
</script>
<style scoped>
.comment-latest-item-body {
  padding: 18px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  /* 顶部对齐 */
  align-items: flex-start;
}
.comment-latest-item-body:last-child {
  border-bottom: none;
}
.comment-latest-item-avatar-body {
  margin-right: 10px;
}
.comment-latest-item-content-body {
  width: calc(100% - 60px);
}
.comment-latest-item-nickname-body {
  /* 单行省略 */
  /* overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; */
  width: 100%;
}
.comment-latest-item-comment-body {
  word-break: break-all;
}
.comment-latest-item-date {
  color: #999;
  font-size: 13px;
  font-weight: 400;
}
</style>
