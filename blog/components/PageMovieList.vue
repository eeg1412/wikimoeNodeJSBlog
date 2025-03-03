<template>
  <div class="pt-2 pb-2 page-movie-body">
    <div class="flex items-center">
      <div class="mr-3 acgn-filter-popover">
        <UPopover :popper="{ arrow: true }" v-model:open="filterOpen">
          <UButton
            :label="filterText"
            size="sm"
            variant="soft"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          />
          <template #panel="{ close }">
            <div class="acgn-filter-popover-body">
              <div class="pt-3 pl-3 pr-3">
                <!-- 关键词输入 -->
                <div class="mb-3">
                  <div class="text-sm font-medium mb-1">关键词</div>
                  <UInput
                    v-model.trim="filterCache.keyword"
                    @keydown.enter="applyFilters(close)"
                    size="sm"
                    maxlength="20"
                    :ui="{ icon: { trailing: { pointer: '' } } }"
                    placeholder="请输入关键词"
                  >
                    <template #trailing>
                      <UButton
                        v-show="filterCache.keyword"
                        color="gray"
                        variant="link"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        @click="filterCache.keyword = undefined"
                      />
                    </template>
                  </UInput>
                </div>

                <!-- 观看年份 -->
                <div class="mb-3">
                  <div class="text-sm font-medium mb-1">观看年份</div>
                  <div class="flex flex-wrap">
                    <div class="mr-1 mb-1">
                      <UButton
                        label="全部年份"
                        size="2xs"
                        :variant="
                          filterCache.year === undefined ? 'solid' : 'ghost'
                        "
                        @click="
                          selectYear(
                            { name: '全部平台', _id: undefined },
                            close
                          )
                        "
                      />
                    </div>
                    <div
                      class="mr-1 mb-1"
                      v-for="(year, index) in yearList"
                      :key="year"
                    >
                      <UButton
                        :label="yearText(year)"
                        size="2xs"
                        :variant="
                          filterCache.year === year.year ? 'solid' : 'ghost'
                        "
                        @click="selectYear(year, close)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 应用按钮 -->
              <div
                class="flex justify-end p-3 border-solid border-t border-gray-200"
              >
                <!-- 取消 -->
                <UButton
                  label="取消"
                  size="sm"
                  variant="ghost"
                  class="mr-2"
                  @click="close"
                />
                <!-- 筛选 -->
                <UButton
                  label="筛选"
                  size="sm"
                  variant="solid"
                  color="primary"
                  :loading="movieLoading"
                  @click="applyFilters(close)"
                />
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${sortTypeMap[params.sortType]}`"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-2">
            <!-- 排序选择器 -->
            <div class="flex flex-wrap">
              <div
                class="mr-1 mb-1"
                v-for="(item, index) in sortTypeList"
                :key="item.value"
              >
                <UButton
                  :label="item.label"
                  size="2xs"
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
      <div v-if="movieList.length > 0" class="mt-5">
        <div class="grid gap-4 xl:grid-cols-2">
          <div v-for="movie in movieList" :key="movie._id" class="mb-1">
            <MovieItem :movie="movie" />
          </div>
        </div>
      </div>
      <div v-else>
        <Empty />
      </div>
      <DivLoading :loading="movieLoading" />
    </div>
    <div class="p-2 flex justify-between items-center" v-if="total > 0">
      <div>
        共<span class="text-primary pl-1 pr-1">{{ total }}</span
        >部电影
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
import {
  getMovieListApi,
  getMovieListApiFetch,
  getMovieYearListApi,
} from '@/api/movie'
const route = useRoute()
const router = useRouter()
const onlyRouteChange = ref(false)
let hash = route.hash
const setRouterQuery = (query) => {
  const nowQuery = route.query
  router.replace({
    query: { ...nowQuery, ...query },
    hash: hash,
  })
}

// 电影列表
const size = 20
const rawQuery = {
  page: 1,
  sortType: 'watchTime',
  year: undefined,
  keyword: undefined,
}
const params = computed(() => {
  const routeQuery = JSON.parse(JSON.stringify(route.query))
  const numberKey = ['page', 'year']
  const newParams = { ...rawQuery }
  Object.keys(newParams).forEach((key) => {
    if (routeQuery[key]) {
      newParams[key] = routeQuery[key]
    }
  })
  numberKey.forEach((key) => {
    if (newParams[key]) {
      const num = Number(newParams[key])
      if (!isNaN(num)) {
        newParams[key] = num
      } else {
        newParams[key] = rawQuery[key]
      }
    }
  })
  return newParams
})

const sortTypeMap = {
  watchTime: '按观看时间排序',
  rating: '按评分排序',
}
const sortTypeList = [
  {
    label: '按观看时间排序',
    value: 'watchTime',
  },
  {
    label: '按评分排序',
    value: 'rating',
  },
]
const selectType = (type, close) => {
  if (movieLoading.value) return
  setRouterQuery({
    sortType: type,
  })
  close()
}

// 观看年份
const yearList = ref([])
await getMovieYearListApi().then((res) => {
  yearList.value = res.data.value.data?.list || []
})
const selectYear = (year, close) => {
  filterCache.year = year.year
}

const checkedParams = {
  ...rawQuery,
}
const initParams = () => {
  // page必须是数字，sortType必须是sortTypeList，moviePlatformId必须是isObjectId
  const queryPage = route.query.page
    ? Math.abs(parseInt(route.query.page, 10))
    : null
  const queryYear = Number(route.query.year)
  const querySortType = route.query.sortType
  const queryKeyword = route.query.keyword
  // page必须是数字
  if (queryPage && !isNaN(queryPage)) {
    params.page = Number(queryPage)
  }
  // year必须是年份列表里的
  if (yearList.value.find((item) => item.year === queryYear)) {
    checkedParams.year = queryYear
  }
  // sortType必须是sortTypeList里的
  if (sortTypeList.find((item) => item.value === querySortType)) {
    checkedParams.sortType = querySortType
  }

  if (queryKeyword && queryKeyword.length <= 20) {
    checkedParams.keyword = queryKeyword
  }

  if (
    import.meta.client &&
    changedParams(checkedParams, params.value).length > 0
  ) {
    console.warn('需要更新路由')
    onlyRouteChange.value = true
    setRouterQuery(checkedParams)
  }
}
initParams()

const movieList = ref([])
const total = ref(0)

// 获取数据
await getMovieListApi(checkedParams).then((res) => {
  movieList.value = res.data.value.list
  total.value = res.data.value.total
})
const hasPrev = computed(() => params.value.page > 1)
const hasNext = computed(() => params.value.page * size < total.value)

const movieLoading = ref(false)
const listRef = ref(null)
const fetchMovieList = async () => {
  movieLoading.value = true
  const newParams = {
    ...params.value,
  }
  const res = await getMovieListApiFetch(newParams)
  movieList.value = res?.list || []
  total.value = res?.total || 0
  movieLoading.value = false
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
    const page = params.value.page - 1
    setRouterQuery({ page })
  }
}
const toNext = () => {
  if (hasNext.value) {
    const page = params.value.page + 1
    setRouterQuery({ page })
  }
}

const filterOpen = ref(false)
const filterCache = reactive({
  keyword: params.value.keyword,
  year: params.value.year,
})
const filterCount = computed(() => {
  let count = 0
  if (params.value.keyword) {
    count++
  }
  if (params.value.year) {
    count++
  }
  return count
})
const filterText = computed(() => {
  if (filterCount.value > 0) {
    return `已应用${filterCount.value}项筛选`
  }
  return '所有内容'
})
// watch filterOpen
watch(filterOpen, (val) => {
  console.log('filterOpen', val)
  if (val) {
    // 还原filterCache
    filterCache.keyword = params.value.keyword
    filterCache.year = params.value.year
  }
})
// 添加一个方法，用于同时应用年份和季度筛选
const applyFilters = async (close) => {
  if (close) close()
  setRouterQuery({
    keyword: filterCache.keyword,
    year: filterCache.year,
    page: 1,
  })
}

const yearText = (year) => {
  return `${year.year}年(${year.count})`
}

// 监听路由变化
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (onlyRouteChange.value) {
      onlyRouteChange.value = false
      return
    }
    console.log('新的query:', newQuery)
    console.log('旧的query:', oldQuery)
    // 需要对比的key
    const compareKeys = Object.keys(rawQuery)
    // 拾取newQuery中的compareKeys
    const newQueryCompareObj = {}
    compareKeys.forEach((key) => {
      if (newQuery[key]) {
        newQueryCompareObj[key] = newQuery[key]
      }
    })
    // 拾取oldQuery中的compareKeys
    const oldQueryCompareObj = {}
    compareKeys.forEach((key) => {
      if (oldQuery[key]) {
        oldQueryCompareObj[key] = oldQuery[key]
      }
    })
    // 对比两个对象
    const diff = changedParams(newQueryCompareObj, oldQueryCompareObj)
    if (diff.length > 0) {
      fetchMovieList()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    // 如果movieList为0，且page不为1，则重新获取数据
    if (movieList.value.length === 0 && params.page > 1) {
      console.log('重新获取数据')
      setRouterQuery({
        page: 1,
      })
    }
    hash = undefined
  })
})
</script>
<style scoped></style>
