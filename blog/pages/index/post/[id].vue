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
        <div class="comment-list-title">评论：</div>
        <div
          class="comment-list-item"
          v-for="(item, index) in commentList"
          :key="item._id"
        >
          <div class="comment-list-item-avatar-body">
            <a :href="item.url" target="_blank" v-if="item.url">
              <Avatar :avatar="item.avatar" :alt="item.nickname" />
            </a>
            <Avatar :avatar="item.avatar" :alt="item.nickname" v-else />
          </div>
          <div class="comment-list-item-right-info">
            <div>
              <div class="comment-list-item-author">
                <a :href="item.url" target="_blank" v-if="item.url">{{
                  item.nickname
                }}</a>
                <span v-else>{{ item.nickname }}</span>
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
            <div class="comment-list-item-content">{{ item.content }}</div>
            <!-- 按钮 -->
            <!-- 喜欢按钮 -->
            <div class="comment-list-item-btns">
              <div class="comment-list-item-btn type-like">
                <UIcon class="mr5" name="i-heroicons-heart" />
                <span>{{ formatNumber(item.likes) }}</span>
              </div>
              <!-- 回复按钮 -->
              <div class="comment-list-item-btn">回复</div>
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
            }"
            :firstButton="{
              variant: 'ghost',
            }"
            :lastButton="{
              variant: 'ghost',
            }"
            :prevButton="{
              variant: 'ghost',
            }"
            :nextButton="{
              variant: 'ghost',
            }"
            :showFirst="true"
            :showLast="true"
            :max="5"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getDetailApi } from '@/api/post'
import { getCommentListApi } from '@/api/comment'

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
const getCommentList = async () => {
  getCommentListApi({
    id: postid,
    page: commentPage.value,
  }).then((res) => {
    console.log(res)
    commentData.value = res
  })
}
watch(
  () => commentPage.value,
  () => {
    getCommentList()
  }
)
onMounted(() => {
  getCommentList()
})
</script>
<style scoped>
.post-detail-body {
  position: relative;
  background: #fff;
  padding: 20px;
}
.post-blog-head {
  display: flex;
  /* 垂直居中 */
  align-items: center;
  margin-bottom: 0px;
  border-bottom: 1px solid #e2e2e2;
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
  color: #ef90a7;
}
.post-detail-like-body {
  text-align: center;
  margin-bottom: 20px;
}
/* 评论 */
.comment-list-body {
  border-top: 1px solid #e2e2e2;
  padding-top: 20px;
}
.comment-list-title {
  font-size: 16px;
  font-weight: 700;
}
.comment-list-item {
  display: flex;
  border-bottom: 1px solid #e2e2e2;
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
}
.comment-list-item-parent-content {
  border: none;
  border-left: 5px solid #eee;
  padding: 3px 10px;
  margin: 10px 0;
  color: #949494;
  font-size: 12px;
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
  border: 1px solid #e2e2e2;
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
