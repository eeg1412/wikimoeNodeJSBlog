<template>
  <div>
    <div class="post-list-body">
      <div v-if="postsData?.list.length > 0">
        <div
          v-for="(item, index) in postsData.list"
          :key="item._id"
          class="post-list-body-item pointer hover:bg-gray-50"
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
              ><span class="tenten"></span>
              <ClientOnly
                ><span class="cGray94" :title="formatDate(item.date)">{{
                  fromNow(item.date, 'yyyy-MM-dd')
                }}</span
                ><template #fallback
                  ><span class="cGray94">{{ item.dateStr }}</span></template
                > </ClientOnly
              ><template v-if="item.sort"
                ><span class="tenten"></span
                ><NuxtLink
                  class="cGray94 common-a"
                  :to="{
                    name: 'postListSort',
                    params: {
                      sortid: item.sort.alias || item.sort._id,
                      page: 1,
                    },
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
            <!-- prettier-ignore -->
            <template v-if="item.type === 1">
              <div class="whitespace-pre-wrap" v-if="item.type === 1">{{ item.excerpt || '发表了一篇博文' }}</div>
              <!-- tags -->
              <div class="post-list-tags-body" v-if="item.tags.length > 0">
                <template v-for="(tag, index) in item.tags" :key="index">
                  <NuxtLink
                    class="post-list-tag-item hover:underline"
                    :to="{
                      name: 'postListTag',
                      params: { tagid: tag._id, page: 1 },
                    }"
                    >#{{ tag.tagname }}</NuxtLink
                  >
                </template>
              </div>
            </template>
            <template v-else>
              <TweetContent
                :content="item.excerpt"
                :coverLength="item?.coverImages?.length"
              >
                <!-- tags -->
                <template v-slot:tags>
                  <!-- tags -->
                  <div class="post-list-tags-body" v-if="item.tags.length > 0">
                    <template v-for="(tag, index) in item.tags" :key="index">
                      <NuxtLink
                        class="post-list-tag-item hover:underline"
                        :to="{
                          name: 'postListTag',
                          params: { tagid: tag._id, page: 1 },
                        }"
                        >#{{ tag.tagname }}</NuxtLink
                      >
                    </template>
                  </div>
                </template>
              </TweetContent>
            </template>
          </div>

          <!-- 图片 -->
          <template v-if="item.type === 1">
            <PostItem :post="item" />
          </template>
          <div
            v-else-if="item.type === 2 && item.coverImages.length > 0"
            class="post-list-tweet-cover-body"
          >
            <TweetImgList :coverImages="item.coverImages" />
          </div>
          <!-- 统计信息左边阅读数 右边点赞数 -->
          <div class="post-list-info-bottom-body cGray94">
            <div class="dflex flexCenter">
              <div class="mr15 dflex flexCenter">
                <!-- icon book-open -->
                <UIcon class="mr5 f15" name="i-heroicons-book-open" />
                <span class="cGray94">{{ formatNumber(item.views) }} 阅读</span>
              </div>
              <div class="dflex flexCenter">
                <!-- icon chat-bubble-left-ellipsis -->
                <UIcon
                  class="mr5 f15"
                  name="i-heroicons-chat-bubble-left-ellipsis"
                />
                <span class="cGray94"
                  >{{ formatNumber(item.comnum) }} 评论</span
                >
              </div>
            </div>

            <div
              class="dflex flexCenter cursor-pointer hover:text-primary-500"
              :class="item.isLike ? 'text-primary-500' : 'cGray94'"
              @click.stop="likePost(item._id)"
              v-if="likeListInited"
            >
              <!-- 加载 -->
              <UIcon
                class="mr5 f15 animate-spin"
                name="i-heroicons-arrow-path"
                v-if="getLikePostIsLoading(item._id)"
              />
              <!-- heart -->
              <UIcon
                class="mr5 f15"
                name="i-heroicons-heart-solid"
                v-else-if="item.isLike"
              />
              <!-- heart-outline -->
              <UIcon class="mr5 f15" name="i-heroicons-heart" v-else />

              <span>{{ formatNumber(item.likes) }} 点赞</span>
            </div>
            <div class="dflex flexCenter" v-else>
              <USkeleton class="h-2 w-[50px]" />
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
    <ClientOnly>
      <Teleport to="#rightToolBar">
        <PostListFilterBtn @btnClick="switchFilterMenu" />
      </Teleport>
      <Teleport to="#rightToolBarMenu">
        <transition name="fade">
          <div class="common-right-tool-menu-body" v-show="showFilterMenu">
            <div class="common-right-tool-menu-box">
              <div
                class="flex justify-between items-center bg-white border-b border-solid border-gray-200 text-base px-4 py-3"
              >
                <div>类型筛选</div>
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="switchFilterMenu"
                >
                  <UIcon name="i-heroicons-x-mark" />
                </button>
              </div>
              <div class="custom-scroll common-right-tool-menu">
                <ul class="common-right-tool-menu-item-ul">
                  <li>
                    <div
                      class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                      :class="{
                        active: postType !== '1' && postType !== '2',
                      }"
                      @click="switchPostType(null)"
                    >
                      全部类型
                    </div>
                  </li>
                  <li>
                    <div
                      class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                      :class="{ active: postType === '1' }"
                      @click="switchPostType('blog')"
                    >
                      博文
                    </div>
                  </li>
                  <li>
                    <div
                      class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-400 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
                      :class="{ active: postType === '2' }"
                      @click="switchPostType('tweet')"
                    >
                      推文
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { getPostsApi, postLikeLogListApi, postLikeLogApi } from '@/api/post'
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const defaultCover = options.value.siteDefaultCover || ''
const sitePageSize = computed(() => options.value.sitePageSize || 1)
const route = useRoute()
const router = useRouter()
const toast = useToast()
const postRouteType = computed(() => route.params.type)
const postType = computed(() => {
  if (postRouteType.value === 'blog') {
    return '1'
  } else if (postRouteType.value === 'tweet') {
    return '2'
  } else {
    return undefined
  }
})

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
          type: postRouteType.value,
        },
      }
      to.lastRoute = {
        name: routeName.value,
        params: {
          page: totalPage.value,
          type: postRouteType.value,
        },
      }
      to.prevRoute = {
        name: routeName.value,
        params: {
          page: page - 1,
          type: postRouteType.value,
        },
      }
      to.nextRoute = {
        name: routeName.value,
        params: {
          page: page + 1,
          type: postRouteType.value,
        },
      }
      break

    default:
      break
  }
  return to
})
// 如果page不是正整数，报错去404页面
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: '页面不存在',
  })
  throw new Error('页面不存在')
}
const [postsDataResponse] = await Promise.all([
  getPostsApi({
    page,
    keyword,
    pageType: apiType.value,
    sortid: sortid,
    year,
    month,
    tags: tagid ? [tagid] : null,
    type: postType.value ? postType.value : null,
  }),
])

const { data: postsData } = postsDataResponse

if (postsData?.value?.list && import.meta.server) {
  postsData.value.list.forEach((item, index) => {
    postsData.value.list[index].dateStr = fromNow(item.date, 'yyyy-MM-dd')
  })
}

const totalPage = computed(() => {
  return Math.ceil(postsData.value.total / postsData.value.size)
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
  console.log(e)
  // 如果是点击了链接，就不跳转
  if (e.target.tagName === 'A') {
    return
  }
  // 如果是选中了文字且点击了div元素，就不跳转
  const selection = window.getSelection()
  if (
    selection &&
    selection.toString().length > 0 &&
    (e.target.tagName === 'DIV' || e.target.tagName === 'SPAN')
  ) {
    return
  }

  let id = item._id
  const alias = item.alias
  if (alias) {
    id = alias
  }
  const routeName = 'postDetail'
  // 判断是否按着ctrl键，如果是就在新标签页打开
  // 如果middle为true，就在新标签页打开
  if (middle || e.ctrlKey || e.metaKey) {
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
const likeListInited = ref(false)
const likeListLoading = ref(false)
const likeList = ref([])
const postLikeLogList = () => {
  const postIdList = postsData.value.list.map((item) => item._id)
  likeListLoading.value = true
  postLikeLogListApi({ postIdList })
    .then((res) => {
      likeList.value = res.list
      postsData.value.list.forEach((item, index) => {
        const likeData = res.list.find((likeItem) => likeItem.post === item._id)
        if (likeData && likeData.like) {
          if (item.likes === 0) {
            // 延迟补偿
            postsData.value.list[index].likes = 1
          }
          postsData.value.list[index].isLike = likeData.like
        }
      })
    })
    .finally(() => {
      likeListInited.value = true
      likeListLoading.value = false
    })
}
const checkIsLike = (postId) => {
  const likeData = likeList.value.find((item) => item.post === postId)
  if (likeData) {
    return likeData.like
  } else {
    return false
  }
}
const getLikeDataByPostId = (postId) => {
  const likeData = likeList.value.find((item) => item.post === postId)
  if (likeData) {
    return likeData
  } else {
    return null
  }
}

const likePostIsLoading = reactive({})
const getLikePostIsLoading = (postId) => {
  return likePostIsLoading[postId] === true
}
const likePost = (postId) => {
  if (likePostIsLoading[postId]) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = checkIsLike(postId)
  const __v = getLikeDataByPostId(postId)?.__v
  likePostIsLoading[postId] = true

  postLikeLogApi({ id: postId, like: !like, __v })
    .then((res) => {
      // 将对应的likeList里的postId替换为res.data
      const index = likeList.value.findIndex((item) => item.post === postId)
      if (index > -1) {
        likeList.value[index] = res.data
      } else {
        likeList.value.push(res.data)
      }
      const newLike = res.data.like
      // postsData.value.list 找到对应的postId，将likes数量根据newLike加减
      const postIndex = postsData.value.list.findIndex(
        (item) => item._id === postId
      )

      const post = postsData.value.list[postIndex]
      const newLikeCount = newLike ? post.likes + 1 : post.likes - 1
      postsData.value.list[postIndex].likes = newLikeCount
      postsData.value.list[postIndex].isLike = newLike
    })
    .catch((err) => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach((item) => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
          })
        })
      }
    })
    .finally(() => {
      likePostIsLoading[postId] = false
    })
}

// 文章筛选
const showFilterMenu = ref(false)
const switchFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}
const switchPostType = (type) => {
  if (type === postType.value) {
    return
  }
  const params = route.params
  params.page = 1
  params.type = type
  router.push({
    params: params,
  })
  showFilterMenu.value = false
}

onMounted(() => {
  postLikeLogList()
})
</script>
<style scoped>
/* .post-list-body {
  padding: 15px;
  padding-bottom: 0px;
} */
.post-list-body {
  font-size: 15px;
}
.post-list-body-item {
  @apply border-solid border-b border-gray-200;
  padding: 13px 18px;
}
.post-list-info-body {
  margin-bottom: 5px;
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
  margin-right: 9px;
  display: inline-block;
  @apply text-primary-500;
}
.post-list-info-bottom-body {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.post-list-page-body {
  @apply text-gray-400;
  padding: 18px 0px;
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
