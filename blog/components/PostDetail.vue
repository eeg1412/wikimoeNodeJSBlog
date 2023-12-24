<template>
  <div class="post-detail-body" v-if="postData?.data">
    <!-- {{ postData.data }} -->
    <!-- 头部 -->
    <div class="post-blog-head" v-if="postData.data.type === 1">
      <div class="post-author-avatar-body">
        <img
          class="post-author-avatar"
          :src="postData.data.author.photo"
          width="50"
          height="50"
        />
      </div>
      <div class="post-right-info">
        <h2 class="post-title">{{ postData.data.title }}</h2>
        <p class="post-extra cGray94">
          作者：{{ postData.data.author.nickname
          }}<span class="tenten">·</span>时间：{{
            formatDate(postData.data.date)
          }}<span class="tenten">·</span
          ><span class="post_sort_link_span" v-if="postData.data.sort"
            >分类 :
            <NuxtLink
              class="common-a"
              :to="{
                name: 'postListSort',
                params: { sortid: postData.data.sort._id, page: 1 },
              }"
            >
              {{ postData.data.sort.sortname }}
            </NuxtLink></span
          >
        </p>
      </div>
    </div>
    <div class="post-blog-head" v-else-if="postData.data.type === 2">
      <div class="post-author-avatar-body">
        <img
          class="post-author-avatar"
          :src="postData.data.author.photo"
          width="50"
          height="50"
        />
      </div>
      <div class="post-right-info">
        <h2 class="post-title">{{ postData.data.author.nickname }}</h2>
        <p class="post-extra cGray94">
          时间：{{ formatDate(postData.data.date)
          }}<template v-if="postData.data.sort"
            ><span class="tenten">·</span
            ><span class="post_sort_link_span"
              >分类 :
              <NuxtLink
                class="common-a"
                :to="{
                  name: 'postListSort',
                  params: { sortid: postData.data.sort._id, page: 1 },
                }"
              >
                {{ postData.data.sort.sortname }}
              </NuxtLink></span
            ></template
          >
        </p>
      </div>
    </div>
    <!-- 文章内容 -->
    <HtmlContent
      :content="postData.data.content"
      v-if="postData.data.type === 1 || postData.data.type === 3"
    />
    <div
      v-else-if="postData.data.type === 2"
      class="post-tweet-detail-content-body"
    >
      <div class="post-tweet-detail-content">{{ postData.data.excerpt }}</div>
      <div class="post-tweet-detail-cover-list-body">
        <TweetImgList
          :coverImages="postData.data.coverImages"
          :swiperMode="false"
        />
      </div>
    </div>
    <!-- tags -->
    <div class="post-detail-tags-body" v-if="postData.data.tags.length > 0">
      <template v-for="(tag, index) in postData.data.tags" :key="index">
        <NuxtLink
          class="post-detail-tag-item"
          :to="{
            name: 'postListTag',
            params: { tagid: tag._id, page: 1 },
          }"
          >#{{ tag.tagname }}</NuxtLink
        >
      </template>
    </div>
    <!-- 点赞按钮 -->
    <div class="post-detail-like-body">
      <UButton
        icon="i-heroicons-heart"
        size="md"
        color="primary"
        variant="solid"
        :label="`${formatNumber(postData.data.likes)}点赞`"
        :trailing="false"
      />
    </div>
    <!-- 评论 -->
    <!-- 评论列表 commentList -->
    <ClientOnly>
      <div class="comment-list-body">
        <!-- 评论form -->
        <CommentForm
          :postid="postid"
          :commentid="commentid"
          @refresh="refreshCommentList"
        />
        <div class="relative">
          <DivLoading :loading="commentLoading" />
          <!-- 评论 -->
          <div
            class="mt-5 pt-5 border-t border-solid border-gray-200"
            ref="commentListRef"
            v-if="commentTotal > 0"
          >
            <div class="comment-list-title">评论：</div>
            <div
              class="comment-list-item"
              v-for="(item, index) in commentList"
              :key="item._id"
            >
              <div class="flex">
                <div class="comment-list-item-avatar-body">
                  <a :href="item.url" target="_blank" v-if="item.url">
                    <Avatar :avatar="item.avatar" :alt="item.nickname" />
                  </a>
                  <Avatar :avatar="item.avatar" :alt="item.nickname" v-else />
                </div>
                <div class="comment-list-item-right-info">
                  <div>
                    <div
                      class="comment-list-item-author flex justify-between items-center"
                    >
                      <div>
                        <a :href="item.url" target="_blank" v-if="item.url">{{
                          item.nickname
                        }}</a>
                        <span v-else>{{ item.nickname }}</span>
                        <UBadge class="ml-1" size="xs" v-if="item.isAdmin"
                          >管理员</UBadge
                        >
                      </div>

                      <div>
                        <!-- 置顶图标 -->
                        <UIcon
                          class="cPink f18"
                          name="i-heroicons-bars-arrow-up"
                          v-if="item.top"
                        />
                      </div>
                    </div>
                    <div class="comment-list-item-date">
                      {{ fromNow(item.date) }}
                    </div>
                  </div>
                  <blockquote
                    class="comment-list-item-parent-content"
                    v-if="item.parent"
                  >
                    {{ item.parent.content }}
                  </blockquote>
                  <div class="comment-list-item-content">
                    {{ item.content }}
                  </div>
                  <!-- 按钮 -->
                  <!-- 喜欢按钮 -->
                  <div class="comment-list-item-btns">
                    <UButton
                      size="xs"
                      icon="i-heroicons-heart"
                      color="white"
                      variant="solid"
                      >{{ formatNumber(item.likes) }}</UButton
                    >
                    <template v-if="options.siteEnableComment">
                      <UButton
                        size="xs"
                        color="white"
                        variant="ghost"
                        @click="openComment(item._id)"
                        v-if="item._id !== commentid"
                        >回复</UButton
                      >
                      <UButton
                        size="xs"
                        color="white"
                        variant="ghost"
                        @click="closeComment"
                        v-else
                        >取消</UButton
                      >
                    </template>
                  </div>
                  <div class="mt-5">
                    <!-- 回复表单 -->
                    <CommentForm
                      :postid="postid"
                      :commentid="commentid"
                      @refresh="refreshCommentList"
                      v-if="commentid === item._id"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 翻页 -->
          <div class="comment-page-body">
            <UPagination
              v-model="commentPage"
              :page-count="commentSize"
              :total="commentTotal"
              size="md"
              :inactiveButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs',
              }"
              :activeButton="{
                size: 'xs',
              }"
              :firstButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs',
              }"
              :lastButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs',
              }"
              :prevButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs',
              }"
              :nextButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs',
              }"
              :showFirst="true"
              :showLast="true"
              :max="7"
              v-if="commentTotal > 0"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getDetailApi } from '@/api/post'
import { getCommentListApi } from '@/api/comment'
import { storeToRefs } from 'pinia'
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const route = useRoute()
const id = route.params.id
const routeName = route.name
let type = null
switch (routeName) {
  case 'postDetail':
    type = [1, 2]
    break
  case 'pageDetail':
    type = [2]
    break

  default:
    break
}
const [postDataResponse] = await Promise.all([
  getDetailApi({
    id,
    type,
  }),
])
const { data: postData } = postDataResponse
const postid = postData.value.data._id
// comment
const commentPage = ref(1)
const commentData = ref({
  list: [],
  total: 0,
  size: 1,
})
const commentList = computed(() => {
  return commentData.value.list
})
const commentTotal = computed(() => {
  return commentData.value.total
})
const commentSize = computed(() => {
  return commentData.value.size
})
const commentLoading = ref(false)
const getCommentList = async (goToCommentListRef) => {
  commentLoading.value = true
  getCommentListApi({
    id: postid,
    page: commentPage.value,
  })
    .then((res) => {
      console.log(res)
      commentData.value = res
      nextTick(() => {
        if (goToCommentListRef) {
          const rect = commentListRef.value.getBoundingClientRect()
          window.scrollBy({
            top: rect.top - 100,
            behavior: 'smooth',
          })
        }
      })
    })
    .finally(() => {
      commentLoading.value = false
    })
}
const commentListRef = ref(null)

const commentid = ref('')
const openComment = (id) => {
  commentid.value = id
}
const closeComment = () => {
  commentid.value = ''
}
const refreshCommentList = () => {
  commentPage.value = 1
  getCommentList()
}
watch(
  () => commentPage.value,
  () => {
    getCommentList(true)
  }
)
onMounted(() => {
  getCommentList()
})
</script>
<style scoped>
.post-detail-body {
  position: relative;
  padding: 20px;
}
.post-blog-head {
  display: flex;
  /* 垂直居中 */
  align-items: center;
  margin-bottom: 0px;
  @apply border-solid border-b border-gray-200;
  padding-bottom: 10px;
}
.post-author-avatar-body {
  margin-right: 10px;
  width: 50px;
  height: 50px;
}
.post-author-avatar {
  border-radius: 8px;
}
.post-right-info {
  flex: 1;
}
.post-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 3px;
}
.post-extra {
  font-size: 12px;
  line-height: 1.5;
}
/* 推文 */
.post-tweet-detail-content-body {
  padding-top: 10px;
  margin-bottom: 10px;
}
.post-tweet-detail-content {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 10px;
}
.post-detail-tags-body {
  margin-top: 5px;
}
.post-detail-tag-item {
  margin-right: 12px;
  @apply text-primary-500;
}
.post-detail-like-body {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
/* 评论 */
.comment-list-body {
  padding-top: 20px;
}
.comment-list-title {
  font-size: 16px;
  font-weight: 700;
}
.comment-list-item {
  @apply border-solid border-b border-gray-200;
  padding: 20px 0;
}
.comment-list-item-avatar-body {
  margin-right: 10px;
}
.comment-list-item-right-info {
  flex: 1;
}
.comment-list-item-author {
  font-size: 14px;
  font-weight: 700;
  margin-right: 10px;
}
.comment-list-item-date {
  font-size: 12px;
  color: #949494;
}
.comment-list-item-parent-content,
.comment-list-item-content {
  /* 允许换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-list-item-parent-content {
  border: none;
  border-left: 5px solid #eee;
  padding: 3px 10px;
  margin: 10px 0;
  color: #949494;
  font-size: 12px;
  background: #f9f9f9;
  border-radius: 3px;
}
.comment-list-item-content {
  font-size: 14px;
  line-height: 1.5;
}
.comment-list-item-btns {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.comment-list-item-btn {
  font-size: 12px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.comment-list-item-btn.type-like {
  @apply border-solid border-b border-gray-200;
  color: #949494;
  padding: 1px 8px;
  border-radius: 10px;
}
.comment-page-body {
  /* 居中 */
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
