<template>
  <div v-if="postsData">
    <div class="post-list-body">
      <div
        v-for="(item, index) in postsData.list"
        :key="item._id"
        class="post-list-body-item"
      >
        <!-- 作者 时间 分类名 -->
        <div class="post-list-info-body">
          <span>{{ item.author?.nickname }}</span
          ><span class="tenten">·</span
          ><span class="cGray94">{{ fromNow(item.date) }}</span
          ><template v-if="item.sort"
            ><span class="tenten">·</span
            ><span class="cGray94">{{ item.sort?.sortname }}</span></template
          >
        </div>
        <!-- 简介/推文 -->
        <div class="post-list-excerpt-body">{{ item.excerpt }}</div>
        <!-- tags -->
        <div class="post-list-tags-body" v-if="item.tags.length > 0">
          <template v-for="(tag, index) in item.tags" :key="index">
            <!-- TODO:到时候是链接 -->
            <span class="post-list-tag-item">#{{ tag.tagname }}</span>
          </template>
        </div>
        <!-- 图片 -->
        <template v-if="item.type === 1">
          <div class="post-list-blog-panel">
            <div class="post-list-blog-cover-body">
              <WikimoeImage
                class="post-list-blog-cover-img"
                :src="
                  item.coverImages[0].thumfor || item.coverImages[0].filepath
                "
                :alt="item.coverImages[0].filename"
                :width="
                  item.coverImages[0].thumWidth || item.coverImages[0].width
                "
                :height="
                  item.coverImages[0].thumHeight || item.coverImages[0].height
                "
                v-if="item.coverImages[0]"
              />
              <!-- TODO:默认封面图 -->
            </div>
            <!-- title -->
            <div class="post-list-title-body">
              <div>{{ item.title }}</div>
            </div>
          </div>
        </template>
        <!-- 统计信息左边阅读数 右边点赞数 -->
        <div class="post-list-info-bottom-body cGray94">
          <div class="dflex flexCenter">
            <div class="mr15 dflex flexCenter">
              <!-- icon book-open -->
              <UIcon class="mr5" name="i-heroicons-book-open" />
              <span class="cGray94">{{ formatNumber(item.views) }} 阅读</span>
            </div>
            <div class="dflex flexCenter">
              <!-- icon chat-bubble-left-ellipsis -->
              <UIcon class="mr5" name="i-heroicons-chat-bubble-left-ellipsis" />
              <span class="cGray94">{{ formatNumber(item.comnum) }} 评论</span>
            </div>
          </div>
          <div class="dflex flexCenter">
            <!-- heart -->
            <UIcon class="mr5" name="i-heroicons-heart" />
            <span class="cGray94">{{ formatNumber(item.likes) }} 点赞</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 上一页 1/20 下一页 -->
    <div class="dflex flexCenter post-list-page-body">
      <div class="mr15">
        <NuxtLink
          class="dflex flexCenter"
          :to="`/post/list/${page - 1}`"
          v-if="page > 1"
        >
          <UIcon class="mr5" name="i-heroicons-chevron-left" />
          <span>上一页</span>
        </NuxtLink>
      </div>
      <div class="mr15">
        <span>{{ page }}/{{ totalPage }}</span>
      </div>
      <div>
        <NuxtLink
          class="dflex flexCenter"
          :to="`/post/list/${page + 1}`"
          v-if="page < totalPage"
        >
          <span>下一页</span>
          <UIcon class="ml5" name="i-heroicons-chevron-right" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getPostsApi } from '@/api/post'
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

definePageMeta({
  alias: '/',
  name: 'post-list',
})
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const sitePageSize = computed(() => options.value.sitePageSize || 1)
const route = useRoute()
const page = route.params.page ? Number(route.params.page) : 1
console.log(page)

const { data: postsData } = await getPostsApi({
  page,
})
const totalPage = computed(() => {
  return Math.ceil(postsData.value.total / sitePageSize.value)
})

console.log(postsData)

onMounted(() => {
  console.log('mounted')
})
</script>
<style scoped>
.post-list-body {
  padding: 15px;
}
.post-list-body-item {
  border-bottom: 1px solid #e2e2e2;
  margin-bottom: 15px;
}
.post-list-info-body {
  margin-bottom: 8px;
}
.post-list-excerpt-body {
  margin-bottom: 8px;
}
.post-list-tags-body {
  margin-bottom: 8px;
}
.post-list-tag-item {
  margin-right: 8px;
  color: #ef90a7;
}
.post-list-blog-panel {
  margin-bottom: 8px;
}
.post-list-blog-cover-img {
  border-radius: 20px 20px 0px 0px;
  border-top: 1px solid #e2e2e2;
  border-right: 1px solid #e2e2e2;
  border-left: 1px solid #e2e2e2;
}
.post-list-title-body {
  border-radius: 0px 0px 20px 20px;
  border: 1px solid #e2e2e2;
  background: #fff;
  padding: 10px 20px;
  box-sizing: border-box;
  font-size: 15px;
}
.post-list-info-bottom-body {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding-bottom: 8px;
}
.post-list-page-body {
  padding-bottom: 20px;
}
</style>
