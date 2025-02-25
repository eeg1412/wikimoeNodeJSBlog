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
                        v-show="filterCache.keyword !== ''"
                        color="gray"
                        variant="link"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        @click="filterCache.keyword = ''"
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
                      :key="year.year"
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
                      :key="season"
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
                  @click="applyFilters(close)"
                />
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${sortTypeMap[sortType]}`"
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
                  :variant="sortType === item.value ? 'solid' : 'ghost'"
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
        <div class="grid xl:grid-cols-2 gap-4">
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
  getBangumiListApi,
  getBangumiListApiFetch,
  getBangumiYearListApi,
} from '@/api/bangumi'
const route = useRoute()
const router = useRouter()
const setRouterQuery = (query) => {
  const nowQuery = route.query
  const queryCopy = JSON.parse(JSON.stringify(query))
  if (queryCopy.year === -1) {
    queryCopy.year = undefined
  }
  if (queryCopy.season === -1) {
    queryCopy.season = undefined
  }
  if (queryCopy.status === -1) {
    queryCopy.status = undefined
  }
  // keyword为空时，不传递keyword
  if (queryCopy.keyword === '') {
    queryCopy.keyword = undefined
  }
  router.replace({
    query: { ...nowQuery, ...queryCopy },
    hash: route.hash,
  })
}

const { data: yearListData } = await getBangumiYearListApi()

const sortType = ref('default')
const sortTypeMap = {
  default: '默认排序',
  rating: '按评分排序',
}
const sortTypeList = [
  {
    label: '默认排序',
    value: 'default',
  },
  {
    label: '按评分排序',
    value: 'rating',
  },
]
const selectType = (type, close) => {
  sortType.value = type
  fetchBangumiList()
  close()
}

const page = ref(1)
const size = 20
const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value * size < total.value)
const toPrev = () => {
  if (hasPrev.value) {
    page.value--
    fetchBangumiList()
  }
}
const toNext = () => {
  if (hasNext.value) {
    page.value++
    fetchBangumiList()
  }
}

const yearList = computed(() => {
  const list = JSON.parse(JSON.stringify(yearListData.value?.data.list || '[]'))
  //  遍历list，将其中的seasons 数组从小到大排序
  list.forEach((item) => {
    item.seasonList.sort((a, b) => {
      return a - b
    })
  })
  const allYear = {
    year: -1,
    seasonList: [1, 2, 3, 4],
  }
  list.unshift(allYear)
  return list
})

const formatYearText = (year) => {
  return year === -1 ? '所有年份' : `${year}年`
}
const total = ref(0)
const selectYear = ref(-1)

const selectSeason = ref(-1)
const selectSeasonList = computed(() => {
  // yearList.value
  const year = filterCache.year
  if (!year) return []
  const yearItem = yearList.value.find((item) => item.year === year)
  const seasonList = JSON.parse(JSON.stringify(yearItem?.seasonList || '[]'))
  seasonList.unshift(-1)
  return seasonList
})

// 状态
const selectStatus = ref(-1)
const statusList = [
  {
    label: '全部',
    value: -1,
  },
  {
    label: '弃坑',
    value: 99,
  },
]

// 关键词
const keyword = ref('')

const initParams = () => {
  const queryYear = route.query.year ? Number(route.query.year) : null
  const querySeason = route.query.season ? Number(route.query.season) : null
  // 校验年份是否存在
  let yearItem =
    queryYear && yearList.value.find((item) => item.year === queryYear)
  if (yearItem) {
    selectYear.value = queryYear
  } else {
    selectYear.value = -1
  }
  // 校验季度是否存在
  if (yearItem) {
    const seasonItem =
      querySeason && yearItem.seasonList.find((item) => item === querySeason)
    if (seasonItem) {
      selectSeason.value = querySeason
    } else {
      selectSeason.value = -1
    }
  } else {
    selectSeason.value = -1
  }
  // 检查page
  const queryPage = route.query.page
    ? Math.abs(parseInt(route.query.page, 10))
    : 1
  // page必须是数字
  if (queryPage && !isNaN(queryPage)) {
    page.value = queryPage
  }

  // sortType必须是sortTypeList里的
  const querySortType = route.query.sortType
  if (sortTypeList.find((item) => item.value === querySortType)) {
    sortType.value = querySortType
  }

  // 检查状态
  let queryStatus = route.query.status
  // status必须是数字且在statusList里
  if (queryStatus) {
    const queryStatusNumber = Number(queryStatus)
    const statusItem = statusList.find(
      (item) => item.value === queryStatusNumber
    )
    if (statusItem) {
      queryStatus = queryStatusNumber
      selectStatus.value = queryStatus
    }
  }

  // 检查关键词
  let queryKeyword = route.query.keyword
  if (queryKeyword && queryKeyword.length <= 20) {
    keyword.value = queryKeyword
  }

  // 客户端执行，校验是否产生路由不一致
  if (import.meta.client) {
    const newQuery = {}
    if (queryYear && selectYear.value !== queryYear) {
      newQuery.year = selectYear.value
    }
    if (querySeason && selectSeason.value !== querySeason) {
      newQuery.season = selectSeason.value
    }
    if (page.value !== queryPage) {
      newQuery.page = page.value
    }
    if (querySortType && sortType.value !== querySortType) {
      newQuery.sortType = sortType.value
    }
    if (queryStatus && selectStatus.value !== queryStatus) {
      newQuery.status = selectStatus.value
    }
    if (queryKeyword && keyword.value !== queryKeyword) {
      newQuery.keyword = keyword.value
    }
    console.log('newQuery', newQuery)
    if (Object.keys(newQuery).length > 0) {
      setRouterQuery(newQuery)
    }
  }
}
initParams()
const bangumiList = ref([])
const params = {
  page: page.value,
  sortType: sortType.value,
}
if (selectYear.value && selectYear.value !== -1) {
  params.year = selectYear.value
}
if (selectSeason.value && selectSeason.value !== -1) {
  params.season = selectSeason.value
}
if (selectStatus.value && selectStatus.value !== -1) {
  params.status = selectStatus.value
}
if (keyword.value) {
  params.keyword = keyword.value
}
await getBangumiListApi(params).then((res) => {
  bangumiList.value = res.data.value.data.list
  total.value = res.data.value.data.total
})

const listRef = ref(null)
const bangumiLoading = ref(false)
const fetchBangumiList = async () => {
  const params = {
    page: page.value,
    sortType: sortType.value,
  }
  if (selectYear.value && selectYear.value !== -1) {
    params.year = selectYear.value
  }
  if (selectSeason.value && selectSeason.value !== -1) {
    params.season = selectSeason.value
  }
  if (selectStatus.value && selectStatus.value !== -1) {
    params.status = selectStatus.value
  }
  if (keyword.value) {
    params.keyword = keyword.value
  }
  bangumiLoading.value = true
  const res = await getBangumiListApiFetch(params)
    .then((res) => {
      const query = {
        year: selectYear.value,
        season: selectSeason.value,
        page: page.value,
        sortType: sortType.value,
        status: selectStatus.value,
        keyword: keyword.value,
      }

      setRouterQuery(query)
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
        behavior: 'smooth',
      })
    }
  })
}
// 选择了年份
const selectYearHandle = async (year) => {
  filterCache.year = year
  filterCache.season = selectSeasonList.value[0]
}
// 选择了季度
const selectSeasonHandle = async (season) => {
  filterCache.season = season
}

const filterOpen = ref(false)
const filterCache = reactive({
  year: selectYear.value,
  season: selectSeason.value,
  status: selectStatus.value,
  keyword: keyword.value,
})
const filterCount = computed(() => {
  let count = 0
  if (selectYear.value !== -1) {
    count++
  }
  if (selectSeason.value !== -1) {
    count++
  }
  if (selectStatus.value !== -1) {
    count++
  }
  if (keyword.value) {
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
    filterCache.year = selectYear.value
    filterCache.season = selectSeason.value
    filterCache.status = selectStatus.value
    filterCache.keyword = keyword.value
  }
})
// 添加一个方法，用于同时应用年份和季度筛选
const applyFilters = async (close) => {
  if (close) close()
  selectYear.value = filterCache.year
  selectSeason.value = filterCache.season
  selectStatus.value = filterCache.status
  keyword.value = filterCache.keyword
  page.value = 1
  await fetchBangumiList()
}

onMounted(() => {
  nextTick(() => {
    if (bangumiList.value.length === 0 && params.page > 1) {
      page.value = 1
      fetchBangumiList()
    }
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
