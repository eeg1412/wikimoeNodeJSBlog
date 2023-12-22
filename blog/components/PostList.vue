<template>
  <div v-if="postsData">
    <div class="post-list-body">
      <div v-if="postsData?.list.length > 0">
        <div
          v-for="(item, index) in postsData.list"
          :key="item._id"
          class="post-list-body-item pointer"
          @click="(e) => goPostDetail(e, item)"
          @click.middle="(e) => goPostDetail(e, item, true)"
        >
          <!-- seo 为了抓取链接 -->
          <NuxtLink
            class="none"
            :to="{
              name: 'postDetail',
              params: { id: item.alias || item._id },
            }"
          >
            {{ item.title || item.excerpt }}
          </NuxtLink>
          <!-- 作者 时间 分类名 -->
          <div class="clearfix">
            <div class="post-list-info-body fl">
              <span class="fb">{{ item.author?.nickname }}</span
              ><span class="tenten">·</span
              ><span class="cGray94" :title="formatDate(item.date)">{{
                fromNow(item.date, 'yyyy-MM-dd')
              }}</span
              ><template v-if="item.sort"
                ><span class="tenten">·</span
                ><NuxtLink
                  class="cGray94 common-a"
                  :to="{
                    name: 'postListSort',
                    params: { sortid: item.sort._id, page: 1 },
                  }"
                  v-if="item.sort"
                >
                  {{ item.sort.sortname }}
                </NuxtLink></template
              >
            </div>
            <div class="fr">
              <!-- 置顶图标 -->
              <UIcon
                class="cPink f18"
                name="i-heroicons-bars-arrow-up"
                v-if="showTopIcon(item)"
              />
            </div>
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
                <NuxtLink
                  class="post-list-tag-item"
                  :to="{
                    name: 'postListTag',
                    params: { tagid: tag._id, page: 1 },
                  }"
                  >#{{ tag.tagname }}</NuxtLink
                >
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
                <!-- 默认封面图 defaultCover -->
                <WikimoeImage
                  class="post-list-blog-cover-img"
                  :src="defaultCover"
                  :alt="item.title"
                  v-else
                />
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
    <div class="dflex post-list-page-body prev-page-btn" v-if="totalPage > 0">
      <div class="dflex page-link-body">
        <!-- 去第一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="routePagination.firstRoute"
          v-if="page > 1"
        >
          <UIcon class="mr5" name="i-heroicons-chevron-double-left" />
        </NuxtLink>

        <!-- 去上一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="routePagination.prevRoute"
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
          :to="routePagination.nextRoute"
          v-if="page < totalPage"
        >
          <UIcon class="ml5" name="i-heroicons-chevron-right" />
        </NuxtLink>
        <!-- 去最后一页 -->
        <NuxtLink
          class="dflex flexCenter page-link"
          :to="routePagination.lastRoute"
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
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const defaultCover = options.value.siteDefaultCover || ''
const sitePageSize = computed(() => options.value.sitePageSize || 1)
const route = useRoute()
const router = useRouter()

const routeName = computed(() => route.name)
const page = route.params.page ? Number(route.params.page) : 1
const keyword = route.params.keyword || ''
const sortid = route.params.sortid || ''
const year = route.params.year || ''
const month = route.params.month || ''
const tagid = route.params.tagid || ''
const apiType = computed(() => {
  switch (routeName.value) {
    case 'postList':
      return 'post'
    case 'postListKeyword':
      return 'keyword'
    case 'postListSort':
      return 'sort'
    case 'postListArchive':
      return 'archive'
    case 'postListTag':
      return 'tag'
    default:
      break
  }
})
// routePagination
const routePagination = computed(() => {
  const to = {
    // 第一页
    firstRoute: {},
    // 最后一页
    lastRoute: {},
    // 上一页
    prevRoute: {},
    // 下一页
    nextRoute: {},
  }
  switch (routeName.value) {
    case 'postList':
    case 'postListKeyword':
    case 'postListSort':
    case 'postListArchive':
    case 'postListTag':
      to.firstRoute = {
        name: routeName.value,
        params: {
          page: 1,
        },
      }
      to.lastRoute = {
        name: routeName.value,
        params: {
          page: totalPage.value,
        },
      }
      to.prevRoute = {
        name: routeName.value,
        params: {
          page: page - 1,
        },
      }
      to.nextRoute = {
        name: routeName.value,
        params: {
          page: page + 1,
        },
      }
      break

    default:
      break
  }
  return to
})

const [postsDataResponse] = await Promise.all([
  getPostsApi({
    page,
    keyword,
    pageType: apiType.value,
    sortid: sortid,
    year,
    month,
    tags: tagid ? [tagid] : null,
  }),
])

const { data: postsData } = postsDataResponse

const totalPage = computed(() => {
  return Math.ceil(postsData.value.total / sitePageSize.value)
})

const showTopIcon = (item) => {
  switch (routeName.value) {
    case 'postList':
      return item.top
    case 'postListSort':
      return item.sortop

    default:
      break
  }
}

const goPostDetail = (e, item, middle) => {
  // 如果是点击了链接，就不跳转
  if (e.target.tagName === 'A') {
    return
  }

  let id = item._id
  const alias = item.alias
  if (alias) {
    id = alias
  }
  const routeName = 'postDetail'
  // 如果middle为true，就在新标签页打开
  if (middle) {
    // resolveUrl
    const url = router.resolve({
      name: routeName,
      params: { id },
    }).href
    window.open(url, '_blank')
  } else {
    router.push({
      name: routeName,
      params: {
        id: id,
      },
    })
  }
}

// console.log(postsData)

onMounted(() => {})
</script>
<style scoped>
.post-list-body {
  padding: 15px;
  padding-bottom: 0px;
}
.post-list-body-item {
  @apply border-solid border-b border-gray-200;
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
  @apply text-primary-500;
}
.post-list-blog-panel {
  margin-bottom: 12px;
}
.post-list-blog-cover-img {
  border-radius: 20px 20px 0px 0px;
  @apply border-solid border-t border-r border-l border-gray-200;
}
.post-list-title-body {
  border-radius: 0px 0px 20px 20px;
  @apply border-solid border border-gray-200 bg-white;
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
  @apply text-gray-400;
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
  @apply text-primary-500;
}
</style>
