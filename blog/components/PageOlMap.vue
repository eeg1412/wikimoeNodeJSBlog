<template>
  <div>
    <div class="page-olmap-body">
      <DivLoading :loading="mappointLoading" text="加载中..." />
      <div class="page-olmap-container">
        <OlMap
          :markers="mappointList"
          v-show="mappointList.length > 0"
          @markerClick="tryOpenMappoint"
        />
        <div
          class="page-olmap-empty text-primary-500"
          v-show="mappointList.length === 0"
        >
          <div v-show="!mappointLoading">暂无地点标记</div>
        </div>
      </div>
    </div>
    <CommonDialog v-model:show="mappointOpen">
      <template #title>
        <h3
          class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
        >
          {{ currentData?.title }}
        </h3>
      </template>
      <template #body>
        <div v-if="currentData">
          <div class="mappoint-detail-content">
            <div
              v-if="currentData.summary"
              class="mappoint-summary mb-3 border-b border-dashed border-gray-200 dark:border-gray-700 pb-3"
            >
              {{ currentData.summary }}
            </div>

            <!-- 文章列表 -->
            <div class="mappoint-post-list">
              <DivLoading :loading="postListLoading" />
              <div>
                <div class="mappoint-post-list-body">
                  <div
                    v-if="postList.length > 0"
                    class="content-grid-list-2-1-dialog"
                    :class="{
                      'is-odd': postList.length % 2 !== 0
                    }"
                  >
                    <PostAllTypeItem
                      v-for="post in postList"
                      :key="post._id"
                      :item="post"
                    />
                  </div>
                  <div
                    v-else-if="!postListLoading"
                    class="text-center text-gray-500 py-4"
                  >
                    暂无相关文章
                  </div>
                </div>

                <!-- 翻页组件 -->
                <div
                  v-if="postTotal > postPageSize"
                  class="mt-2 flex justify-center"
                >
                  <UPagination
                    v-model="postPage"
                    :page-count="postPageSize"
                    :total="postTotal"
                    size="md"
                    :inactiveButton="{
                      variant: 'ghost',
                      color: 'gray',
                      size: 'xs'
                    }"
                    :activeButton="{
                      size: 'xs'
                    }"
                    :firstButton="{
                      variant: 'ghost',
                      color: 'gray',
                      size: 'xs'
                    }"
                    :lastButton="{
                      variant: 'ghost',
                      color: 'gray',
                      size: 'xs'
                    }"
                    :prevButton="{
                      variant: 'ghost',
                      color: 'gray',
                      size: 'xs'
                    }"
                    :nextButton="{
                      variant: 'ghost',
                      color: 'gray',
                      size: 'xs'
                    }"
                    :showFirst="true"
                    :showLast="true"
                    :max="7"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="tc text-gray-500 py-5">数据加载中...</div>
        </div>
      </template>
    </CommonDialog>
  </div>
</template>

<script setup>
import {
  getMappointListApiFetch,
  getMappointDetailApiFetch,
  getMappointPostListApiFetch
} from '@/api/mappoint'

const router = useRouter()
const route = useRoute()
const onlyRouteChange = ref(false)
let hash = route.hash

const setRouterQuery = query => {
  const nowQuery = route.query
  router.replace({
    query: { ...nowQuery, ...query },
    hash: hash
  })
}

const toast = useToast()

const mappointList = ref([])
const mappointLoading = ref(true)

const getList = async () => {
  mappointLoading.value = true
  mappointList.value = []
  const res = await getMappointListApiFetch()
    .then(res => {
      return res
    })
    .catch(err => {
      console.log(err)
    })
  mappointList.value = res?.list || []
  mappointLoading.value = false
}

const mappointOpen = ref(false)
const currentData = ref(null)

// 文章列表相关数据
const postList = ref([])
const postListLoading = ref(false)
const postPage = ref(1)
const postPageSize = ref(10)
const postTotal = ref(0)

const tryOpenMappoint = data => {
  // currentData.value = data
  // mappointOpen.value = true
  // 路由添加mappointid
  onlyRouteChange.value = true
  setRouterQuery({ mappointid: data._id })
}

const getMappointDetail = async () => {
  mappointLoading.value = true
  const id = route.query.mappointid
  getMappointDetailApiFetch({
    id
  })
    .then(async res => {
      currentData.value = res.data
      // 重置文章列表状态并获取文章列表
      postPage.value = parseInt(route.query.postpage) || 1
      await getPostList()
      mappointOpen.value = true
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            color: 'red',
            title: '错误',
            description: message
          })
        })
      }
      // 获取详情失败时清除URL中的ID，不弹窗
      if (route.query.mappointid) {
        setRouterQuery({ mappointid: undefined, postpage: undefined })
      }
    })
    .finally(() => {
      mappointLoading.value = false
    })
}

// 获取文章列表
const getPostList = async (page = null) => {
  if (!currentData.value) return

  const targetPage = page || postPage.value
  postListLoading.value = true

  try {
    const res = await getMappointPostListApiFetch({
      id: currentData.value._id,
      page: targetPage
    })

    postList.value = res.list || []
    postTotal.value = res.total || 0

    // 如果页码大于1且文章数为0，重置页码为1
    if (targetPage > 1 && res.list && res.list.length === 0 && res.total > 0) {
      postPage.value = 1
      setRouterQuery({ postpage: 1 })
      // 重新获取第一页数据
      return getPostList(1)
    } else {
      // 将 .page-commonDialog-current-commonDialog-body 滚动条置顶
      nextTick(() => {
        const dialogBody = document.querySelector(
          '.page-commonDialog-current-commonDialog-body'
        )
        if (dialogBody) {
          // 平滑滚动到顶部
          dialogBody.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    }
  } catch (err) {
    console.log(err)
    const errors = err.response?._data?.errors
    if (errors) {
      errors.forEach(item => {
        const message = item.message
        toast.add({
          color: 'red',
          title: '错误',
          description: message
        })
      })
    }
  } finally {
    postListLoading.value = false
  }
}

// 移除旧的翻页方法，改用watch监听postPage变化

// watch route
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (newQuery.mappointid) {
      const data = mappointList.value.find(
        item => item._id === newQuery.mappointid
      )
      if (data) {
        getMappointDetail()
      }
    } else {
      mappointOpen.value = false
    }

    // 监听文章页码变化
    if (newQuery.mappointid && newQuery.postpage && currentData.value) {
      const newPostPage = parseInt(newQuery.postpage) || 1
      if (newPostPage !== postPage.value) {
        getPostList(newPostPage)
      }
    }

    if (onlyRouteChange.value) {
      onlyRouteChange.value = false
    }
  }
)

// 监听文章页码变化
watch(
  () => postPage.value,
  newPage => {
    if (currentData.value && newPage > 0) {
      setRouterQuery({ postpage: newPage })
    }
  }
)

watch(
  () => mappointOpen.value,
  newVal => {
    if (!newVal) {
      setTimeout(() => {
        postList.value = []
        postPage.value = 1
        postTotal.value = 0
        currentData.value = null

        setRouterQuery({ mappointid: undefined, postpage: undefined })
      }, 300)
    }
  }
)

onMounted(() => {
  nextTick(async () => {
    await getList()
    nextTick(() => {
      if (route.query.mappointid) {
        getMappointDetail()
      }
    })
    hash = undefined
  })
})

onUnmounted(() => {})
</script>

<style scoped>
.page-olmap-body {
  @apply border border-primary-200 border-solid dark:border-gray-700;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.page-olmap-container {
  height: calc(100dvh - 16rem);
  width: 100%;
  position: relative;
}

.page-olmap-empty {
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mappoint-detail-content {
  max-width: 100%;
}

.mappoint-summary {
  line-height: 1.6;
}

.mappoint-coords {
  border-top: 1px solid #eee;
  padding-top: 8px;
  margin-top: 8px;
}
</style>
