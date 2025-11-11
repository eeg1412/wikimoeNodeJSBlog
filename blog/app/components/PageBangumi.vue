<template>
  <div class="pt-2 pb-2 page-bangumi-body">
    <div class="flex items-center">
      <!-- 顶部年份季度选择 -->
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
                        color="neutral"
                        variant="subtle"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        @click="filterCache.keyword = undefined"
                      />
                    </template>
                  </UInput>
                </div>

                <!-- 年份选择 -->
                <div class="mb-2">
                  <div class="text-sm font-medium mb-1">年份</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="year in yearList"
                      :key="year.year || -1"
                      class="mr-1 mb-1"
                    >
                      <UButton
                        :label="`${formatYearText(year.year)}`"
                        size="2xs"
                        :variant="
                          year.year === filterCache.year ? 'solid' : 'ghost'
                        "
                        @click="selectYearHandle(year.year)"
                      />
                    </div>
                  </div>
                </div>

                <!-- 季度选择器 -->
                <div class="mb-2">
                  <div class="text-sm font-medium mb-1">季度</div>
                  <TransitionGroup
                    name="season-list"
                    tag="div"
                    class="flex flex-wrap"
                  >
                    <div
                      v-for="season in selectSeasonList"
                      :key="season || -1"
                      class="mr-1 mb-1"
                    >
                      <UButton
                        :label="seasonToName(season)"
                        size="2xs"
                        :variant="
                          season === filterCache.season ? 'solid' : 'ghost'
                        "
                        @click="selectSeasonHandle(season)"
                      />
                    </div>
                  </TransitionGroup>
                </div>

                <!-- 状态选择器 -->
                <div class="mb-2">
                  <div class="text-sm font-medium mb-1">状态</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="status in statusList"
                      :key="status.value"
                      class="mr-1 mb-1"
                    >
                      <UButton
                        :label="status.label"
                        size="2xs"
                        :variant="
                          status.value === filterCache.status
                            ? 'solid'
                            : 'ghost'
                        "
                        @click="filterCache.status = status.value"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 应用按钮 -->
              <div
                class="flex justify-end p-3 border-solid border-t border-gray-200 dark:border-gray-700"
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
                  :loading="bangumiLoading"
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
      <!-- 番剧列表 -->
      <div v-if="bangumiList.length > 0" class="mt-5">
        <div class="grid gap-2">
          <div v-for="bangumi in bangumiList" :key="bangumi._id" class="mb-1">
            <BangumiItem :bangumi="bangumi" />
          </div>
        </div>
      </div>
      <div v-else>
        <Empty />
      </div>
      <DivLoading :loading="bangumiLoading" />
    </div>
    <div class="p-2 flex justify-between items-center" v-if="total > 0">
      <div>
        共计<span class="text-primary pl-1 pr-1">{{ total }}</span
        >部番剧
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
            base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0'
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
            base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0'
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
  getBangumiListApi,
  getBangumiListApiFetch,
  getBangumiYearListApi
} from '@/api/bangumi'
const route = useRoute()
const router = useRouter()
const onlyRouteChange = ref(false)
let hash = route.hash
const setRouterQuery = query => {
  const nowQuery = route.query
  router.replace({
    query: { ...nowQuery, ...query },
    hash: hash
  })
}

const { data: yearListData } = await getBangumiYearListApi()

const rawQuery = {
  year: undefined,
  season: undefined,
  page: 1,
  sortType: 'default',
  status: undefined,
  keyword: undefined
}
const params = computed(() => {
  const routeQuery = JSON.parse(JSON.stringify(route.query))
  const numberKey = ['page', 'status', 'year', 'season']
  const newParams = { ...rawQuery }
  Object.keys(newParams).forEach(key => {
    if (routeQuery[key]) {
      newParams[key] = routeQuery[key]
    }
  })
  numberKey.forEach(key => {
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
  default: '默认排序',
  rating: '按评分排序'
}
const sortTypeList = [
  {
    label: '默认排序',
    value: 'default'
  },
  {
    label: '按评分排序',
    value: 'rating'
  }
]
const selectType = (type, close) => {
  if (bangumiLoading.value) return
  setRouterQuery({ sortType: type })
  close()
}

const size = 20
const hasPrev = computed(() => params.value.page > 1)
const hasNext = computed(() => params.value.page * size < total.value)
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

const yearList = computed(() => {
  const list = JSON.parse(JSON.stringify(yearListData.value?.data.list || '[]'))
  //  遍历list，将其中的seasons 数组从小到大排序
  list.forEach(item => {
    item.seasonList.sort((a, b) => {
      return a - b
    })
  })
  const allYear = {
    year: undefined,
    seasonList: [1, 2, 3, 4]
  }
  list.unshift(allYear)
  return list
})

const formatYearText = year => {
  return year === undefined ? '所有年份' : `${year}年`
}
const total = ref(0)
const selectSeasonList = computed(() => {
  // yearList.value
  const year = filterCache.year
  if (!year && year !== undefined) return []
  const yearItem = yearList.value.find(item => item.year === year)
  const seasonList = JSON.parse(JSON.stringify(yearItem?.seasonList || '[]'))
  seasonList.unshift(undefined)
  return seasonList
})

// 状态
const statusList = [
  {
    label: '全部',
    value: undefined
  },
  {
    label: '弃坑',
    value: 99
  }
]

const checkedParams = {
  ...rawQuery
}
const initParams = () => {
  const queryYear = route.query.year ? Number(route.query.year) : null
  const querySeason = route.query.season ? Number(route.query.season) : null
  // 校验年份是否存在
  let yearItem =
    queryYear && yearList.value.find(item => item.year === queryYear)
  if (yearItem) {
    checkedParams.year = queryYear
  }
  // 校验季度是否存在
  if (yearItem) {
    const seasonItem =
      querySeason && yearItem.seasonList.find(item => item === querySeason)
    if (seasonItem) {
      checkedParams.season = querySeason
    }
  }
  // 检查page
  const queryPage = route.query.page
    ? Math.abs(parseInt(route.query.page, 10))
    : 1
  // page必须是数字
  if (queryPage && !isNaN(queryPage)) {
    checkedParams.page = queryPage
  }

  // sortType必须是sortTypeList里的
  const querySortType = route.query.sortType
  if (sortTypeList.find(item => item.value === querySortType)) {
    checkedParams.sortType = querySortType
  }

  // 检查状态
  const queryStatus = route.query.status
  // status必须是数字且在statusList里
  if (queryStatus) {
    const queryStatusNumber = Number(queryStatus)
    const statusItem = statusList.find(item => item.value === queryStatusNumber)
    if (statusItem) {
      checkedParams.status = queryStatus
    }
  }

  // 检查关键词
  const queryKeyword = route.query.keyword
  if (queryKeyword && queryKeyword.length <= 20) {
    checkedParams.keyword = queryKeyword
  }

  // 客户端执行，校验是否产生路由不一致
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
const bangumiList = ref([])
await getBangumiListApi(checkedParams).then(res => {
  bangumiList.value = res.data.value.data.list
  total.value = res.data.value.data.total
})

const listRef = ref(null)
const bangumiLoading = ref(false)
const fetchBangumiList = async () => {
  bangumiLoading.value = true
  const newParams = {
    ...params.value
  }
  const res = await getBangumiListApiFetch(newParams)
    .then(res => {
      return res
    })
    .catch(() => {
      return null
    })
  bangumiList.value = res?.data?.list || []
  total.value = res?.data?.total || 0
  bangumiLoading.value = false
  nextTick(() => {
    if (listRef.value) {
      // const rect = listRef.value.getBoundingClientRect()
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  })
}
// 选择了年份
const selectYearHandle = async year => {
  filterCache.year = year
  filterCache.season = selectSeasonList.value[0]
}
// 选择了季度
const selectSeasonHandle = async season => {
  filterCache.season = season
}

const filterOpen = ref(false)
const filterCache = reactive({
  year: params.value.year,
  season: params.value.season,
  status: params.value.status,
  keyword: params.value.keyword
})
const filterCount = computed(() => {
  let count = 0
  if (params.value.year) {
    count++
  }
  if (params.value.season) {
    count++
  }
  if (params.value.status) {
    count++
  }
  if (params.value.keyword) {
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
watch(filterOpen, val => {
  console.log('filterOpen', val)
  if (val) {
    // 还原filterCache
    filterCache.year = params.value.year
    filterCache.season = params.value.season
    filterCache.status = params.value.status
    filterCache.keyword = params.value.keyword
  }
})
// 添加一个方法，用于同时应用年份和季度筛选
const applyFilters = async close => {
  if (close) close()
  setRouterQuery({
    year: filterCache.year,
    season: filterCache.season,
    status: filterCache.status,
    keyword: filterCache.keyword,
    page: 1
  })
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
    compareKeys.forEach(key => {
      if (newQuery[key]) {
        newQueryCompareObj[key] = newQuery[key]
      }
    })
    // 拾取oldQuery中的compareKeys
    const oldQueryCompareObj = {}
    compareKeys.forEach(key => {
      if (oldQuery[key]) {
        oldQueryCompareObj[key] = oldQuery[key]
      }
    })
    // 对比两个对象
    const diff = changedParams(newQueryCompareObj, oldQueryCompareObj)
    if (diff.length > 0) {
      fetchBangumiList()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    if (bangumiList.value.length === 0 && params.value.page > 1) {
      setRouterQuery({ page: 1 })
    }
    hash = undefined
  })
})
</script>
<style scoped>
.season-list-move,
.season-list-enter-active,
.season-list-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.season-list-enter-from,
.season-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.season-list-leave-active {
  position: absolute;
}
</style>
