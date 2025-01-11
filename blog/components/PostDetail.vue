<template>
  <div class="post-detail-body" v-if="postData?.data" ref="postDetailBody">
    <!-- 头部 -->
    <div
      class="post-blog-head"
      v-if="postData.data.type === 1 || postData.data.type === 2"
    >
      <div class="post-author-avatar-body">
        <img
          class="post-author-avatar"
          :src="postData.data.author.photo"
          :alt="postData.data.author.nickname"
          width="50"
          height="50"
        />
      </div>
      <div class="post-right-info">
        <h2 class="post-title mb-1" v-if="postData.data.type === 1">
          {{ postData.data.title }}
        </h2>
        <h2 class="post-title mb-1" v-else-if="postData.data.type === 2">
          推文
        </h2>
        <p class="post-extra cGray94">
          作者：{{ postData.data.author.nickname
          }}<span class="tenten"></span>时间：{{ formatDate(postData.data.date)
          }}<span class="post_sort_link_span" v-if="postData.data.sort"
            ><span class="tenten"></span><span>分类：</span>
            <NuxtLink
              class="common-a"
              :to="{
                name: 'postListSort',
                params: {
                  sortid: postData.data.sort.alias || postData.data.sort._id,
                  page: 1,
                },
              }"
            >
              {{ postData.data.sort.sortname }}
            </NuxtLink></span
          >
        </p>
      </div>
    </div>
    <!-- <div class="post-blog-head" v-else-if="postData.data.type === 2">
      <div class="post-author-avatar-body">
        <img
          class="post-author-avatar"
          :src="postData.data.author.photo"
          :alt="postData.data.author.nickname"
          width="50"
          height="50"
        />
      </div>
      <div class="post-right-info">
        <h2 class="post-title">推文</h2>
        <p class="post-extra cGray94">
          作者：{{ postData.data.author.nickname
          }}<span class="tenten"></span>时间：{{ formatDate(postData.data.date)
          }}<template v-if="postData.data.sort"
            ><span class="tenten"></span
            ><span class="post_sort_link_span"
              >分类 :
              <NuxtLink
                class="common-a"
                :to="{
                  name: 'postListSort',
                  params: {
                    sortid: postData.data.sort.alias || postData.data.sort._id,
                    page: 1,
                  },
                }"
              >
                {{ postData.data.sort.sortname }}
              </NuxtLink></span
            ></template
          >
        </p>
      </div>
    </div> -->
    <div v-else-if="postData.data.type === 3">
      <template v-if="pageTemplate === 'almanac'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <PageAlmanac />
          <div class="mb-5"></div>
          <PageSeeking />
        </div>
      </template>
      <template v-else-if="pageTemplate === 'link'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <PageLink />
        </div>
      </template>
      <template v-else-if="pageTemplate === 'about'">
        <PageAbout :author="postData.data.author" />
      </template>
      <!-- bangumi -->
      <template v-else-if="pageTemplate === 'bangumi'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <PageBangumi />
        </div>
      </template>
      <!-- gameList -->
      <template v-else-if="pageTemplate === 'gameList'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <PageGameList />
        </div>
      </template>
      <!-- bookList -->
      <template v-else-if="pageTemplate === 'bookList'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <PageBookList />
        </div>
      </template>
      <!-- event -->
      <template v-else-if="pageTemplate === 'event'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <ClientOnly>
            <PageEvent />
          </ClientOnly>
        </div>
      </template>
      <template v-else>
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
        </div>
      </template>
    </div>
    <!-- 文章内容 -->
    <div
      class="post-html-content-body"
      v-if="postData.data.type === 1 || postData.data.type === 3"
      id="postHtmlContent"
    >
      <HtmlContent :content="postData.data.content" />
      <!-- tags -->
      <div
        class="post-detail-tags-body mt-1 mb-1"
        v-if="postData.data.tags.length > 0"
      >
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

    <div
      v-else-if="postData.data.type === 2"
      class="post-tweet-detail-content-body"
    >
      <div class="post-tweet-detail-content">
        <TweetContent
          :content="postData.data.excerpt"
          :coverLength="postData?.data?.coverImages?.length"
        >
          <!-- tags -->
          <template v-slot:tags>
            <!-- tags -->
            <div
              class="post-detail-tags-body mt-1 mb-1"
              v-if="postData.data.tags.length > 0"
            >
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
          </template>
        </TweetContent>
      </div>
    </div>

    <!-- 运行代码按钮 -->
    <div class="post-run-code-body mt-3 mb-5" v-if="code">
      <UButton
        size="md"
        color="primary"
        variant="solid"
        :label="`运行代码`"
        :trailing="false"
        @click="runCode"
      />
    </div>
    <!-- 推文图片 -->
    <template v-if="postData.data.type === 2">
      <div
        class="post-tweet-detail-cover-list-body mt-3"
        v-if="postData.data.coverImages.length > 0"
      >
        <TweetImgList
          :coverImages="postData.data.coverImages"
          :swiperMode="false"
        />
      </div>
    </template>

    <!-- 点赞按钮 -->
    <div class="post-detail-like-body" v-if="likeListInited">
      <UButton
        icon="i-heroicons-heart-solid"
        size="md"
        color="primary"
        variant="solid"
        :label="`${formatNumber(postData.data.likes)}点赞`"
        :trailing="false"
        :loading="likeListLoading || likePostIsLoading"
        v-if="postData.data.isLike"
        @click="likePost"
      />
      <UButton
        icon="i-heroicons-heart"
        size="md"
        color="primary"
        variant="outline"
        :label="`${formatNumber(postData.data.likes)}点赞`"
        :trailing="false"
        :loading="likeListLoading || likePostIsLoading"
        v-else
        @click="likePost"
      />
    </div>
    <div class="post-detail-like-body dflex flexCenter" v-else>
      <USkeleton class="h-9 w-[90px]" />
    </div>
    <!-- 文章通用底部内容 -->
    <PostCommonFooter
      :post="postData.data"
      v-if="showPostCommonFooter && postData.data"
    />
    <PostAboutEvent :eventList="postData.data.eventList" />
    <PostAbout :postList="postData.data.postList" />
    <PostACG
      :bangumiList="postData.data.bangumiList"
      :gameList="postData.data.gameList"
      :bookList="postData.data.bookList"
    />
    <!-- randomPostList -->
    <PostPageRandomPostList
      v-if="
        postData.data.randomPostList && postData.data.randomPostList.length > 0
      "
      :randomPostList="postData.data.randomPostList"
    />
    <!-- 广告 -->
    <div
      class="google-ad-post-detail mt-4"
      v-if="options.googleAdEnabled && options.googleAdPostBottomEnabled"
    >
      <AdsbygoogleHave :ad="options.googleAdPostBottomParams" />
    </div>
    <!-- 评论 -->
    <!-- 评论列表 commentList -->
    <ClientOnly>
      <div class="comment-list-body">
        <!-- 评论form -->
        <CommentForm
          :postid="postid"
          :allowRemark="postData.data.allowRemark"
          @refresh="refreshCommentList"
        />
        <div class="relative pt-5">
          <DivLoading :loading="commentLoading" text="拼命加载中..." />
          <!-- 评论 -->
          <div
            class="pt-5 border-t border-solid border-gray-200"
            ref="commentListRef"
            v-if="commentTotal > 0"
          >
            <div class="comment-list-title">评论：</div>
            <div
              class="comment-list-item"
              v-for="(item, index) in commentList"
              :id="`post-detail-comment-${item._id}`"
              :key="item._id"
            >
              <div
                class="comment-list-item-alert"
                v-if="alertCommentId === item._id"
              ></div>
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
                      <ClientOnly
                        ><span
                          :title="formatDate(item.date, 'yyyy-MM-dd hh:mm:ss')"
                          >{{ fromNow(item.date, 'yyyy-MM-dd hh:mm') }}</span
                        ><template #fallback>{{
                          formatDate(item.date, 'yyyy-MM-dd hh:mm')
                        }}</template>
                      </ClientOnly>
                    </div>
                  </div>
                  <blockquote
                    class="comment-list-item-parent-content"
                    v-if="item.parent"
                  >
                    <div>
                      <div class="fb">{{ item.parent.nickname }}</div>
                      <div class="mb-1 f13">
                        <ClientOnly
                          ><span
                            :title="
                              formatDate(
                                item.parent.date,
                                'yyyy-MM-dd hh:mm:ss'
                              )
                            "
                            >{{
                              fromNow(item.parent.date, 'yyyy-MM-dd hh:mm')
                            }}</span
                          ><template #fallback>{{
                            formatDate(item.parent.date, 'yyyy-MM-dd hh:mm')
                          }}</template>
                        </ClientOnly>
                      </div>
                    </div>
                    <div>{{ item.parent.content }}</div>
                  </blockquote>
                  <div class="comment-list-item-content">
                    {{ item.content }}
                  </div>
                  <!-- 按钮 -->
                  <!-- 喜欢按钮 -->
                  <div class="comment-list-item-btns">
                    <UButton
                      size="2xs"
                      icon="i-heroicons-heart-solid"
                      color="primary"
                      v-if="checkIsCommentLike(item._id)"
                      @click="likeComment(item._id)"
                      :loading="likeCommentIsLoading[item._id] === true"
                      >{{ formatNumber(item.likes) }}</UButton
                    >
                    <UButton
                      size="2xs"
                      icon="i-heroicons-heart"
                      color="white"
                      variant="solid"
                      @click="likeComment(item._id)"
                      :loading="likeCommentIsLoading[item._id] === true"
                      v-else
                      >{{ formatNumber(item.likes) }}</UButton
                    >
                    <template
                      v-if="
                        options.siteEnableComment && postData.data.allowRemark
                      "
                    >
                      <UButton
                        size="2xs"
                        color="white"
                        variant="ghost"
                        @click="openComment(item._id)"
                        v-if="item._id !== commentid"
                        >回复</UButton
                      >
                      <UButton
                        size="2xs"
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
                      :id="`${item._id}-reply`"
                      :postid="postid"
                      :commentid="commentid"
                      :parentNickname="item.nickname || item.user?.nickname"
                      @refresh="refreshCommentList"
                      :allowRemark="postData.data.allowRemark"
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
            <!-- 无数据 -->
            <div
              class="text-center pb-5"
              v-else-if="
                options.siteEnableComment &&
                postData.data.allowRemark &&
                !commentLoading
              "
            >
              <span class="text-gray-500">期待大佬们的评论(☆ω☆)</span>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
    <ClientOnly>
      <!-- headerList -->
      <Teleport to="#rightToolBarMenu">
        <transition name="fade">
          <div class="common-right-tool-menu-body" v-show="showHeaderListMenu">
            <div class="common-right-tool-menu-box">
              <div
                class="flex justify-between items-center bg-white border-b border-solid border-gray-200 text-base px-4 py-3"
              >
                <div>文章目录</div>
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="switchShowHeaderListMenu"
                >
                  <UIcon name="i-heroicons-x-mark" />
                </button>
              </div>
              <div class="custom-scroll common-right-tool-menu">
                <PostHeaderItem
                  :list="headerList"
                  :activeHeaderDom="activeHeaderDom"
                  @goToHeader="showHeaderListMenu = false"
                />
              </div>
            </div>
          </div>
        </transition>
      </Teleport>
      <Teleport to="#rightToolBar">
        <PostShowHeaderListBtn
          @btnClick="switchShowHeaderListMenu"
          v-if="headerList.length > 0"
        />
      </Teleport>
    </ClientOnly>
  </div>
</template>
<script setup>
import {
  getDetailApi,
  putViewCountApi,
  postLikeLogListApi,
  postLikeLogApi,
} from '@/api/post'
import {
  getCommentListApi,
  postCommentLikeLogApi,
  postCommentLikeLogListApi,
} from '@/api/comment'
import { storeToRefs } from 'pinia'
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const route = useRoute()
const id = route.params.id
const routeName = route.name
const toast = useToast()
let type = null
switch (routeName) {
  case 'postDetail':
    type = [1, 2]
    break
  case 'pageDetail':
    type = [3]
    break

  default:
    break
}
const [postDataResponse] = await Promise.all([
  getDetailApi({
    id,
    type,
    randompost: routeName === 'postDetail' ? 1 : 0,
  }),
])
const { data: postData } = postDataResponse
const pageTemplate = computed(() => {
  return postData.value?.data?.template
})
const code = computed(() => {
  return postData.value?.data?.code
})
const runCode = () => {
  const runCodeContent = code.value
  // 打开新窗口并运行代码
  const newWindow = window.open()
  newWindow.document.write(runCodeContent)
}
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
let postCommentId = null
if (import.meta.client) {
  postCommentId = sessionStorage.getItem('wm-post-commentid')
  if (postCommentId) {
    // 用逗号拆成数组
    postCommentId = postCommentId.split(',')
    // 取第0个比对postid，如果不一样清空postCommentId
    if (postCommentId[0] !== postid) {
      console.warn('postCommentId postId不一致')
      postCommentId = null
    } else {
      // 取第1个，转为数字
      postCommentId = postCommentId[1]
    }
    // 清空sessionStorage
    sessionStorage.removeItem('wm-post-commentid')
  } else if (route.hash.includes('comment-')) {
    postCommentId = route.hash.split('comment-')[1]
  }
}
const alertCommentId = ref(null)
let alertCommentTimer = null
const postDetailBody = ref(null)
const getCommentList = async (goToCommentListRef) => {
  commentLoading.value = true
  getCommentListApi({
    id: postid,
    page: commentPage.value,
  })
    .then((res) => {
      console.log(res)
      commentData.value = res
      commentLikeLogList()
      nextTick(() => {
        if (commentPage.value === 1 && postCommentId) {
          // 查询id对应的dom
          const commentDom = document.getElementById(
            `post-detail-comment-${postCommentId}`
          )
          if (commentDom) {
            window.scrollBy({
              top: commentDom.getBoundingClientRect().top - 100,
              behavior: 'smooth',
            })
            alertCommentId.value = postCommentId
            alertCommentTimer = setTimeout(() => {
              alertCommentId.value = null
              alertCommentTimer = null
            }, 4500)
          } else {
            console.warn('postCommentId 找不到对应的评论')
          }
        } else if (goToCommentListRef) {
          // const rect = commentListRef.value.getBoundingClientRect()
          const elementRect = commentListRef.value.getBoundingClientRect()
          const parentRect = postDetailBody.value.getBoundingClientRect()
          const distanceToParentTop = elementRect.top - parentRect.top
          window.scrollTo({
            top: distanceToParentTop - 100,
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
  nextTick(() => {
    // 根据id找textarea
    const textareaBlock = document.getElementById(`${id}-reply`)
    // 找到.comment-form-textarea 下的textarea
    const textarea = textareaBlock.querySelector(
      '.comment-form-textarea textarea'
    )
    if (textarea) {
      textarea.focus()
    }
  })
}
const closeComment = () => {
  commentid.value = ''
}
const refreshCommentList = () => {
  commentPage.value = 1
  getCommentList(true)
}

watch(
  () => commentPage.value,
  () => {
    getCommentList(true)
  }
)
// 评论点赞
const commentLikeListInited = ref(false)
const commentLikeListLoading = ref(false)
const commentLikeList = ref([])
const commentLikeLogList = () => {
  const commentIdList = commentData.value.list.map((item) => item._id)
  commentLikeListLoading.value = true
  postCommentLikeLogListApi({ commentIdList })
    .then((res) => {
      commentLikeList.value = res.list
    })
    .finally(() => {
      commentLikeListInited.value = true
      commentLikeListLoading.value = false
    })
}
const checkIsCommentLike = (commentId) => {
  const likeData = commentLikeList.value.find(
    (item) => item.comment === commentId
  )
  if (likeData) {
    return likeData.like
  } else {
    return false
  }
}
const getLikeDataByCommentId = (commentId) => {
  const likeData = commentLikeList.value.find(
    (item) => item.comment === commentId
  )
  if (likeData) {
    return likeData
  } else {
    return null
  }
}

const likeCommentIsLoading = reactive({})
const likeComment = (commentId) => {
  if (likeCommentIsLoading[commentId]) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = checkIsCommentLike(commentId)
  const __v = getLikeDataByCommentId(commentId)?.__v
  likeCommentIsLoading[commentId] = true

  postCommentLikeLogApi({ id: commentId, like: !like, __v })
    .then((res) => {
      // 将对应的likeList里的commentId替换为res.data
      const index = commentLikeList.value.findIndex(
        (item) => item.comment === commentId
      )
      if (index > -1) {
        commentLikeList.value[index] = res.data
      } else {
        commentLikeList.value.push(res.data)
      }
      const newLike = res.data.like
      // commentData.value.list 找到对应的commentId，将likes数量根据newLike加减
      const commentIndex = commentData.value.list.findIndex(
        (item) => item._id === commentId
      )

      const comment = commentData.value.list[commentIndex]
      const newLikeCount = newLike ? comment.likes + 1 : comment.likes - 1
      commentData.value.list[commentIndex].likes = newLikeCount
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
      likeCommentIsLoading[commentId] = false
    })
}

// viewCount
const putViewCount = () => {
  putViewCountApi({
    id: postid,
  })
}

// post like
const likeListInited = ref(false)
const likeListLoading = ref(false)
const likeList = ref([])
const postLikeLogList = () => {
  const postIdList = [postid]
  likeListLoading.value = true
  postLikeLogListApi({ postIdList })
    .then((res) => {
      likeList.value = res.list
      checkIsLike()
    })
    .finally(() => {
      likeListInited.value = true
      likeListLoading.value = false
    })
}
const checkIsLike = () => {
  const likeData = likeList.value.find((item) => item.post === postid)
  if (likeData) {
    postData.value.data.isLike = likeData.like
    if (likeData.like && postData.value.data.likes === 0) {
      // 缓存补偿
      postData.value.data.likes = 1
    }
  }
}
const getLikeDataByPostId = () => {
  const likeData = likeList.value.find((item) => item.post === postid)
  if (likeData) {
    return likeData
  } else {
    return null
  }
}

const likePostIsLoading = ref(false)
const likePost = () => {
  if (likePostIsLoading.value) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = postData.value.data.isLike
  const __v = getLikeDataByPostId()?.__v
  likePostIsLoading.value = true

  postLikeLogApi({ id: postid, like: !like, __v })
    .then((res) => {
      // 将对应的likeList里的postId替换为res.data
      const index = likeList.value.findIndex((item) => item.post === postid)
      if (index > -1) {
        likeList.value[index] = res.data
      } else {
        likeList.value.push(res.data)
      }
      const newLike = res.data.like
      const newLikeCount = newLike
        ? postData.value.data.likes + 1
        : postData.value.data.likes - 1
      postData.value.data.likes = newLikeCount
      postData.value.data.isLike = newLike
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
      likePostIsLoading.value = false
    })
}

// 过滤HTML标签
const filterHtmlTag = (str) => {
  if (!str) {
    return ''
  }
  // 过滤 <style> 和 <script> 标签及其内容，其他 HTML 标签、换行符和空格
  return str.replace(
    /<(style|script)[^>]*>[\s\S]*?<\/\1>|<[^>]+>|\r?\n|\s/g,
    ''
  )
}
// 设置SEO
const seoImageSet = () => {
  let newImage = options.value.siteUrl + options.value.siteDefaultCover
  if (postData.value?.data?.coverImages?.length > 0) {
    if (postData.value?.data?.coverImages[0]?.thumfor) {
      newImage =
        options.value.siteUrl + postData.value?.data?.coverImages[0]?.thumfor
    } else {
      newImage =
        options.value.siteUrl + postData.value?.data?.coverImages[0]?.filepath
    }
  }
  return newImage
}
const seoTitleSet = () => {
  let newTitle =
    postData.value?.data?.title || postData.value?.data?.excerpt || ''
  // 超过60个字符，截取
  if (newTitle.length > 60) {
    newTitle = limitStr(newTitle, 60)
  }
  return newTitle
}
const seoDescriptionSet = () => {
  let newDescription =
    postData.value?.data?.excerpt ||
    filterHtmlTag(postData.value?.data?.content) ||
    ''
  // 超过200个字符，截取
  if (newDescription.length > 200) {
    newDescription = limitStr(newDescription, 200)
  }
  return newDescription
}
const seoKeywordsSet = () => {
  // 先判断 postData.value?.data?.tags 是否存在，存在就用，不存在就用 options.value.siteKeywords
  if (postData.value?.data?.tags?.length > 0) {
    return postData.value?.data?.tags.map((item) => item.tagname).join(',')
  } else {
    return options.value.siteKeywords
  }
}

const seoImage = seoImageSet()
const seoTitle = seoTitleSet()
const seoDescription = seoDescriptionSet()
const seoKeywords = seoKeywordsSet()
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  keywords: seoKeywords,
  ogDescription: seoDescription,
  ogImage: seoImage,
  // twitter
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
})

// 文章导航
const showHeaderListMenu = ref(false)
const switchShowHeaderListMenu = () => {
  showHeaderListMenu.value = !showHeaderListMenu.value
}
const activeHeaderDom = ref(null)
const parseHeaders = () => {
  const parentElement = document.querySelector(
    '#postHtmlContent .html-content-body'
  )
  const headers = parentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const result = []
  let currentHeader = null

  headers.forEach((header) => {
    const level = parseInt(header.tagName.slice(1))
    const headerObj = {
      tag: header.tagName,
      text: header.textContent,
      dom: header,
      children: [],
    }

    if (currentHeader === null) {
      result.push(headerObj)
    } else {
      while (currentHeader && currentHeader.level >= level) {
        currentHeader = currentHeader.parent
      }
      if (currentHeader) {
        currentHeader.children.push(headerObj)
      } else {
        result.push(headerObj)
      }
    }

    headerObj.level = level
    headerObj.parent = currentHeader
    currentHeader = headerObj
  })
  console.log(result)
  return result
}

const headerList = ref([])
const getHeaderList = () => {
  // 只有 editorVersion 为 5 ，type 为 1 的文章才有文章导航
  if (
    postData.value?.data?.editorVersion === 5 &&
    postData.value?.data?.type === 1
  ) {
    headerList.value = parseHeaders()
    if (headerList.value.length > 0) {
      window.addEventListener('scroll', onScroll)
      onScroll()
    }
  }
}
let scrollTimer = null
const onScroll = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    getActiveHeader()
  }, 300)
}
const getActiveHeader = () => {
  const parentElement = document.querySelector(
    '#postHtmlContent .html-content-body'
  )
  const headers = parentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let closest = null
  let closestDistance = Infinity
  const threshold = window.innerHeight / 2 // 设置阈值为窗口高度的一半
  headers.forEach((header) => {
    const rect = header.getBoundingClientRect()
    const distance = Math.abs(rect.top)
    if (distance < closestDistance && distance <= threshold) {
      // 只有当元素距离窗口顶部的距离小于阈值时，才将其视为最近的元素
      closestDistance = distance
      closest = header
    }
  })
  if (closest) {
    console.log(closest)
    activeHeaderDom.value = closest
  }
}

const showPostCommonFooter = computed(() => {
  const type = postData.value?.data?.type
  if (type === 1) {
    return options.value.sitePostBlogCommonFooterOpen || false
  } else if (type === 2) {
    return options.value.sitePostTweetCommonFooterOpen || false
  } else {
    return false
  }
})

onMounted(() => {
  getCommentList()
  putViewCount()
  postLikeLogList()
  getHeaderList()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (alertCommentTimer) {
    clearTimeout(alertCommentTimer)
  }
})
</script>
<style scoped>
.post-detail-body {
  position: relative;
  padding: 18px;
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
  font-size: 18px;
  font-weight: 700;
}
.post-extra {
  font-size: 13px;
  line-height: 1.5;
}
/* 推文 */
.post-tweet-detail-content-body {
  padding-top: 10px;
}
.post-tweet-detail-content {
  font-size: 16px;
  line-height: 1.5;
  /* 支持换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
.post-detail-tag-item {
  margin-right: 12px;
  font-size: 16px;
  display: inline-block;
  @apply text-primary-500;
}
.post-detail-tag-item:hover {
  text-decoration: underline;
}
.post-detail-like-body {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
/* 评论 */
.comment-list-body {
  @apply mt-4;
}
.comment-list-title {
  font-size: 16px;
  font-weight: 700;
}
.comment-list-item {
  @apply border-solid border-b border-gray-200;
  padding: 18px 0;
  position: relative;
}
.comment-list-item-alert {
  @apply bg-primary-100 rounded-md;
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% + 10px);
  margin-left: -5px;
  height: 100%;
  z-index: 2;
  /* 穿透 */
  pointer-events: none;
  opacity: 0;
  animation: opacityAnimation 0.8s ease-in-out 0s 5;
}
@keyframes opacityAnimation {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
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
  font-size: 13px;
  color: #949494;
}
.comment-list-item-parent-content,
.comment-list-item-content {
  /* 允许换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-list-item-parent-content {
  @apply border-l-4 border-gray-200 p-2 mt-2 mb-2 text-gray-500 bg-gray-50 rounded-md;
}
.comment-list-item-content {
  font-size: 14px;
  line-height: 1.6;
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
.post-html-content-body,
.post-tweet-detail-content-body {
  font-size: 16px;
}
</style>
