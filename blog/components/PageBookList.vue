<template>
  <div class="pt-2 pb-2 page-book-body">
    <div class="flex items-center">
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${selectBooktypeData.name}`"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-4 w-60 max-h-96 overflow-auto">
            <div class="flex flex-wrap">
              <div class="p-2 mr-1 mb-1">
                <UButton
                  label="全部类型"
                  size="sm"
                  :variant="selectBooktypeData._id === null ? 'solid' : 'ghost'"
                  @click="
                    selectBooktype({ name: '全部类型', _id: null }, close)
                  "
                />
              </div>
              <div
                v-for="item in booktypeList"
                :key="item._id"
                class="p-2 mr-1 mb-1"
              >
                <UButton
                  :label="`${item.name}`"
                  size="sm"
                  :variant="
                    item._id === selectBooktypeData._id ? 'solid' : 'ghost'
                  "
                  @click="selectBooktype(item, close)"
                />
              </div>
            </div>
          </div>
        </template>
      </UPopover>
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${sortTypeMap[params.sortType]}`"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-4">
            <!-- 排序选择器 -->
            <div class="flex flex-wrap">
              <div
                class="p-2 mr-1 mb-1"
                v-for="(item, index) in sortTypeList"
                :key="item.value"
              >
                <UButton
                  :label="item.label"
                  size="sm"
                  :variant="params.sortType === item.value ? 'solid' : 'ghost'"
                  @click="selectType(item.value, close)"
                />
              </div>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
    <div class="relative" ref="listRef">
      <!-- 列表 -->
      <div v-if="bookList.length > 0" class="mt-5">
        <div class="grid gap-4 xl:grid-cols-2">
          <div v-for="book in bookList" :key="book._id" class="mb-1">
            <BookItem :book="book" />
          </div>
        </div>
      </div>
      <div v-else>
        <Empty />
      </div>
      <DivLoading :loading="bookLoading" />
    </div>
    <div class="p-2 flex justify-between items-center" v-if="total > 0">
      <div>
        共<span class="text-primary pl-1 pr-1">{{ total }}</span
        >部作品
      </div>
      <div v-show="hasPrev || hasNext">
        <UButton
          icon="i-heroicons-chevron-left"
          size="2xs"
          color="primary"
          square
          variant="outline"
          class="mr-1"
          :ui="{
            base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0',
          }"
          :disabled="!hasPrev"
          @click="toPrev"
        />
        <UButton
          icon="i-heroicons-chevron-right"
          size="2xs"
          color="primary"
          square
          variant="outline"
          :ui="{
            base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0',
          }"
          :disabled="!hasNext"
          @click="toNext"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { getBookListApi, getBooktypeListApi } from '@/api/book'
const route = useRoute()
const router = useRouter()

// 类型
const booktypeList = ref([])
const selectBooktypeData = ref({
  name: '全部类型',
  _id: null,
})

await getBooktypeListApi().then((res) => {
  booktypeList.value = res.data.value.data
})

// 作品列表
const size = 20
const params = reactive({
  page: 1,
  sortType: 'startTime',
  booktypeId: null,
})

const sortTypeMap = {
  startTime: '按开始时间排序',
  rating: '按评分排序',
}
const sortTypeList = [
  {
    label: '按开始时间排序',
    value: 'startTime',
  },
  {
    label: '按评分排序',
    value: 'rating',
  },
]
const selectType = (type, close) => {
  params.sortType = type
  fetchBookList()
  close()
}

const initParams = () => {
  // page必须是数字，sortType必须是sortTypeList，booktypeId必须是isObjectId
  const queryPage = route.query.page
    ? Math.abs(parseInt(route.query.page, 10))
    : null
  const querySortType = route.query.sortType
  const queryBooktypeId = route.query.booktypeId
  // page必须是数字
  if (queryPage && !isNaN(queryPage)) {
    params.page = queryPage
  }
  // sortType必须是sortTypeList里的
  if (sortTypeList.find((item) => item.value === querySortType)) {
    params.sortType = querySortType
  }
  // booktypeId必须是isObjectId
  if (queryBooktypeId && isObjectId(queryBooktypeId)) {
    // 检查queryBooktypeId是否在booktypeList里
    const booktype = booktypeList.value.find(
      (item) => item._id === queryBooktypeId
    )
    if (booktype) {
      selectBooktypeData.value = booktype
      params.booktypeId = queryBooktypeId
    }
  }
  if (process.client && (queryPage || querySortType || queryBooktypeId)) {
    router.replace({
      query: {
        ...route.query,
        ...params,
      },
    })
  }
}
initParams()
const bookList = ref([])
const total = ref(0)

// 获取数据
await Promise.all([
  getBookListApi(params).then((res) => {
    bookList.value = res.data.value.list
    total.value = res.data.value.total
  }),
])
const hasPrev = computed(() => params.page > 1)
const hasNext = computed(() => params.page * size < total.value)

const bookLoading = ref(false)
const listRef = ref(null)
const fetchBookList = async () => {
  bookLoading.value = true
  const newParams = {
    ...params,
  }
  const res = await getBookListApi(newParams)
  bookList.value = res?.data?.value?.list || []
  total.value = res?.data?.value?.total || 0
  bookLoading.value = false
  router.replace({
    query: {
      ...route.query,
      ...params,
    },
  })
  nextTick(() => {
    if (listRef.value) {
      // const rect = listRef.value.getBoundingClientRect()
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  })
}
const toPrev = () => {
  if (hasPrev.value) {
    params.page--
    fetchBookList()
  }
}
const toNext = () => {
  if (hasNext.value) {
    params.page++
    fetchBookList()
  }
}

const selectBooktype = (item, close) => {
  selectBooktypeData.value = item
  params.booktypeId = item?._id
  params.page = 1
  fetchBookList()
  close()
}

onMounted(() => {
  nextTick(() => {
    // 如果bookList为0，且page不为1，则重新获取数据
    if (bookList.value.length === 0 && params.page > 1) {
      params.page = 1
      fetchBookList()
    }
  })
})
</script>
<style scoped></style>
