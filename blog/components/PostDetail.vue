<template>
  <div class="post-detail-body" v-if="postData?.data">
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
        <h2 class="post-title mb-1">{{ postData.data.title }}</h2>
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
    <div v-else-if="3">
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

    <div class="post-detail-like-body" v-if="likeListInited">
      <UButton
        icon="i-heroicons-heart-solid"
        size="md"
        color="primary"
        variant="solid"
        :label="`${formatNumber(postData.data.likes)}点赞`"
        :trailing="false"
        :loading="likeListLoading || likePostIsLoading"
        v-if="checkIsLike()"
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
                      size="2xs"
                      icon="i-heroicons-heart-solid"
                      color="primary"
                      v-if="checkIsCommentLike(item._id)"
                      @click="likeComment(item._id)"
                      >{{ formatNumber(item.likes) }}</UButton
                    >
                    <UButton
                      size="2xs"
                      icon="i-heroicons-heart"
                      color="white"
                      variant="solid"
                      @click="likeComment(item._id)"
                      v-else
                      >{{ formatNumber(item.likes) }}</UButton
                    >
                    <template v-if="options.siteEnableComment">
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

const likeCommentIsLoading = ref(false)
const likeComment = (commentId) => {
  if (likeCommentIsLoading.value) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = checkIsCommentLike(commentId)
  const __v = getLikeDataByCommentId(commentId)?.__v
  likeCommentIsLoading.value = true

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
      likeCommentIsLoading.value = false
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
    })
    .finally(() => {
      likeListInited.value = true
      likeListLoading.value = false
    })
}
const checkIsLike = () => {
  const likeData = likeList.value.find((item) => item.post === postid)
  if (likeData) {
    return likeData.like
  } else {
    return false
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
  let like = checkIsLike()
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
onMounted(() => {
  getCommentList()
  putViewCount()
  postLikeLogList()
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
