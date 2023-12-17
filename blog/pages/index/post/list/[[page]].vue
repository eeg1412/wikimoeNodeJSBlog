<template>
  <div v-if="postsData">
    <div class="top-banner-list-body" v-if="bannerListData">
      <Swiper
        :modules="[SwiperAutoplay, SwiperPagination, SwiperMousewheel]"
        :slides-per-view="1"
        :loop="true"
        :mousewheel="true"
        :autoplay="{
          delay: 8000,
          disableOnInteraction: true,
        }"
        :pagination="{
          type: 'progressbar',
          clickable: true,
        }"
      >
        <SwiperSlide v-for="(item, index) in bannerListData" :key="item._id">
          <div
            class="top-banner-list-item"
            :class="{
              pointer: item.link,
            }"
            @click="openLink(item)"
            @click.middle="openLink(item, true)"
          >
            <WikimoeImage
              class="top-banner-list-item-img"
              :src="item.img"
              :alt="item.title"
              :width="880"
              :height="300"
              loading="lazy"
            />
            <!-- title -->
            <div class="top-banner-list-item-title">
              {{ item.title }}
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
    <!-- {{ bannerListData }} -->
    <div class="post-list-body">
      <div v-if="postsData?.list.length > 0">
        <div
          v-for="(item, index) in postsData.list"
          :key="item._id"
          class="post-list-body-item"
        >
          <!-- 作者 时间 分类名 -->
          <div class="post-list-info-body">
            <span class="fb">{{ item.author?.nickname }}</span
            ><span class="tenten">·</span
            ><span class="cGray94" :title="formatDate(item.date)">{{
              fromNow(item.date, 'yyyy-MM-dd')
            }}</span
            ><template v-if="item.sort"
              ><span class="tenten">·</span
              ><span class="cGray94">{{ item.sort?.sortname }}</span></template
            >
          </div>
          <!-- 简介/推文 -->
          <div class="post-list-excerpt-body">
            <div v-if="item.type === 1">
              {{ item.excerpt || '发表了一篇博文' }}
            </div>
            <div v-else>{{ item.excerpt }}</div>
            <!-- tags -->
            <div class="post-list-tags-body" v-if="item.tags.length > 0">
              <template v-for="(tag, index) in item.tags" :key="index">
                <!-- TODO:到时候是链接 -->
                <span class="post-list-tag-item">#{{ tag.tagname }}</span>
              </template>
            </div>
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
          <div v-else-if="item.type === 2" class="post-list-tweet-cover-body">
            <TweetImgList :coverImages="item.coverImages" />
          </div>
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
                <UIcon
                  class="mr5"
                  name="i-heroicons-chat-bubble-left-ellipsis"
                />
                <span class="cGray94"
                  >{{ formatNumber(item.comnum) }} 评论</span
                >
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
      <div v-else>
        <Empty />
      </div>
    </div>
    <!-- 分页 上一页 1/20 下一页 -->
    <div class="dflex post-list-page-body prev-page-btn">
      <div class="dflex page-link-body">
        <!-- 去第一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="`/post/list/1`"
          v-if="page > 1"
        >
          <UIcon class="mr5" name="i-heroicons-chevron-double-left" />
        </NuxtLink>

        <!-- 去上一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="`/post/list/${page - 1}`"
          v-if="page > 1"
        >
          <UIcon class="mr5" name="i-heroicons-chevron-left" />
        </NuxtLink>
      </div>
      <div>
        <span>{{ page }}/{{ totalPage }}</span>
      </div>
      <div class="dflex page-link-body next-page-btn">
        <!-- 去下一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="`/post/list/${page + 1}`"
          v-if="page < totalPage"
        >
          <UIcon class="ml5" name="i-heroicons-chevron-right" />
        </NuxtLink>
        <!-- 去最后一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="`/post/list/${totalPage}`"
          v-if="page < totalPage"
        >
          <UIcon class="ml5" name="i-heroicons-chevron-double-right" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getPostsApi } from '@/api/post'
import { getBannerListApi } from '@/api/banner'
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

definePageMeta({
  alias: [
    '/',
    '/post/list/sort/:sortid?/:page?',
    '/post/list/tag/:tagid?/:page?',
    '/post/list/keyword/:keyword?/:page?',
  ],
  name: 'post-list',
})
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const sitePageSize = computed(() => options.value.sitePageSize || 1)
const route = useRoute()
const router = useRouter()
const page = route.params.page ? Number(route.params.page) : 1
console.log(page)

const [postsDataResponse, bannerListDataResponse] = await Promise.all([
  getPostsApi({ page }),
  getBannerListApi(),
])

const { data: postsData } = postsDataResponse
const { data: bannerListData } = bannerListDataResponse

const totalPage = computed(() => {
  return Math.ceil(postsData.value.total / sitePageSize.value)
})

// console.log(postsData)

const openLink = (item, midClick) => {
  const { link, isdefault, newtab } = item
  console.log(item)
  if (newtab || midClick) {
    window.open(link)
  } else if (isdefault) {
    router.push(link)
  } else {
    // 本窗口打开
    window.location.href = link
  }
}

onMounted(() => {
  console.log('mounted')
})
</script>
<style scoped>
.post-list-body {
  padding: 15px;
  padding-bottom: 0px;
}
.post-list-body-item {
  border-bottom: 1px solid #e2e2e2;
  margin-bottom: 15px;
}
.post-list-info-body {
  margin-bottom: 12px;
}
.post-list-excerpt-body {
  margin-bottom: 12px;
}
.post-list-tags-body {
  margin-bottom: 12px;
  margin-top: 3px;
}
.post-list-tweet-cover-body {
  margin-bottom: 12px;
}
.post-list-tag-item {
  margin-right: 12px;
  color: #ef90a7;
}
.post-list-blog-panel {
  margin-bottom: 12px;
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
  padding-bottom: 12px;
}
.post-list-page-body {
  color: #4b4b4b;
  padding-bottom: 20px;
  /* 两边 中间  */
  justify-content: space-between;
  /* 垂直居中 */
  align-items: center;
}

.page-link-body {
  font-size: 16px;
  padding: 0 10px;
  width: 60px;
}
.page-link-body.next-page-btn {
  /* 居右 */
  justify-content: flex-end;
}
.page-link {
  margin: 0 2px;
}
.page-link:hover {
  color: #ef90a7;
}

.top-banner-list-body {
  width: 100%;
  margin-bottom: 0px;
  overflow: hidden;
  margin-bottom: -5px;
}
.top-banner-list-item {
  width: 100%;
  /* padding 比例是 880/350 */
  padding-bottom: 39.77%;
  position: relative;
  z-index: 1;
}
.top-banner-list-item-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.top-banner-list-item-title {
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
  height: 28px;
  background: rgba(0, 0, 0, 0.4);
  /* 垂直居中 */
  line-height: 24px;
  padding: 0 40px 0 9px;
  box-sizing: border-box;
  color: #ffffff;
  z-index: 2;
  /* 超过点点点 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<style>
.top-banner-list-body
  .swiper-pagination-progressbar
  .swiper-pagination-progressbar-fill {
  background: #ef90a7 !important;
}
.top-banner-list-body .swiper-pagination-progressbar {
  top: unset !important;
  bottom: 0px !important;
  background: rgba(0, 0, 0, 0.4);
}
</style>
