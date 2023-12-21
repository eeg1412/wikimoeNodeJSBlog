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
.post-detail-tag-item {
  margin-right: 12px;
  color: #ef90a7;
}
</style>
