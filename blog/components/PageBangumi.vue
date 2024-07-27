<template>
  <div class="pt-2 pb-2 page-bangumi-body">
    <div class="flex items-center">
      <!-- 顶部年份季度选择 -->
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${formatYearText(selectYear)}`"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-4 w-60">
            <!-- 年份选择表 -->
            <div class="flex flex-wrap">
              <div
                v-for="year in yearPageList"
                :key="year.year"
                class="w-1/2 p-2"
              >
                <UButton
                  :label="`${formatYearText(year.year)}`"
                  size="sm"
                  :variant="year.year === selectYear ? 'solid' : 'ghost'"
                  @click="selectYearHandle(year.year, close)"
                />
              </div>
            </div>
            <!-- 翻页器 -->
            <div class="flex justify-between items-center mt-4">
              <UButton
                :disabled="yearPage === 1"
                size="sm"
                variant="ghost"
                @click="yearPage--"
              >
                <UIcon class="mr5" name="i-heroicons-chevron-left" />
              </UButton>
              <span class="mx-4 text-gray-500"
                >{{ yearPage }}/{{ yearTotalPage }}</span
              >
              <UButton
                :disabled="yearPage === yearTotalPage"
                size="sm"
                variant="ghost"
                @click="yearPage++"
              >
                <UIcon class="mr5" name="i-heroicons-chevron-right" />
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="seasonToName(selectSeason)"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-4 w-80">
            <!-- 季度选择器 -->
            <div class="flex flex-wrap">
              <div
                v-for="season in selectSeasonList"
                :key="season"
                class="w-1/3 p-2"
              >
                <UButton
                  :label="seasonToName(season)"
                  size="sm"
                  :variant="season === selectSeason ? 'solid' : 'ghost'"
                  @click="selectSeasonHandle(season, close)"
                />
              </div>
            </div>
          </div>
        </template>
      </UPopover>
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${sortTypeMap[sortType]}`"
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
  getBangumiYearListApi,
  getBangumiListApiFetch,
} from '@/api/bangumi'
const route = useRoute()
const router = useRouter()
const setRouterQuert = (query) => {
  const nowQuery = route.query
  const queryCopy = JSON.parse(JSON.stringify(query))
  if (queryCopy.year === -1) {
    queryCopy.year = undefined
  }
  if (queryCopy.season === -1) {
    queryCopy.season = undefined
  }
  router.replace({ query: { ...nowQuery, ...queryCopy } })
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
const selectYear = ref(null)
const yearPageSize = ref(4)
const yearPage = ref(1)
const yearTotalPage = computed(() => {
  return Math.ceil(yearList.value.length / yearPageSize.value)
})
// 当前页的年份列表
const yearPageList = computed(() => {
  const start = (yearPage.value - 1) * yearPageSize.value
  const end = start + yearPageSize.value
  return yearList.value.slice(start, end)
})

const selectSeason = ref(null)
const selectSeasonList = computed(() => {
  // yearList.value
  const year = selectYear.value
  if (!year) return []
  const yearItem = yearList.value.find((item) => item.year === year)
  const seasonList = JSON.parse(JSON.stringify(yearItem?.seasonList || '[]'))
  seasonList.unshift(-1)
  return seasonList
})
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

  // 客户端执行
  if (process.client) {
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
    if (Object.keys(newQuery).length > 0) {
      setRouterQuert(newQuery)
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
  bangumiLoading.value = true
  const res = await getBangumiListApi(params)
    .then((res) => {
      const query = {
        year: selectYear.value,
        season: selectSeason.value,
        page: page.value,
        sortType: sortType.value,
      }

      setRouterQuert(query)
      return res
    })
    .catch(() => {
      return null
    })
  bangumiList.value = res?.data?.value?.data?.list || []
  total.value = res?.data?.value?.data?.total || 0
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
const selectYearHandle = async (year, close) => {
  if (close) close()
  page.value = 1
  selectYear.value = year
  selectSeason.value = selectSeasonList.value[0]
  await fetchBangumiList()
}
// 选择了季度
const selectSeasonHandle = async (season, close) => {
  if (close) close()
  page.value = 1
  selectSeason.value = season
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
<style scoped></style>
