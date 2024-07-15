<template>
  <div class="pt-2 pb-2 page-bangumi-body">
    <div class="flex items-center" v-if="selectYear && selectSeason">
      <!-- 顶部年份季度选择 -->
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${selectYear}年`"
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
                  :label="`${year.year}年`"
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
        />

        <template #panel="{ close }">
          <div class="p-4 w-60">
            <!-- 季度选择器 -->
            <div class="flex flex-wrap">
              <div
                v-for="season in selectSeasonList"
                :key="season"
                class="w-1/2 p-2"
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
    </div>
    <div class="relative">
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
    <div class="p-2" v-if="total > 0">
      共计番剧<span class="text-primary pl-1 pr-1">{{ total }}</span
      >部，当前季度追番<span class="text-primary pl-1 pr-1">{{
        bangumiList.length
      }}</span
      >部
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

const { data: yearListData } = await getBangumiYearListApi()

const yearList = computed(() => {
  const list = yearListData.value?.data.list || []
  //  遍历list，将其中的seasons 数组从小到大排序
  list.forEach((item) => {
    item.seasonList.sort((a, b) => {
      return a - b
    })
  })
  return list
})
const total = computed(() => {
  return yearListData.value.data.total || 0
})
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
// watch selectYear

const selectSeason = ref(null)
const selectSeasonList = computed(() => {
  // yearList.value
  const year = selectYear.value
  if (!year) return []
  const yearItem = yearList.value.find((item) => item.year === year)
  return yearItem?.seasonList || []
})
const initYearSeason = () => {
  const queryYear = route.query.year ? Number(route.query.year) : null
  const querySeason = route.query.season ? Number(route.query.season) : null
  // 校验年份是否存在
  let yearItem = yearList.value.find((item) => item.year === queryYear)
  if (yearItem) {
    selectYear.value = queryYear
  } else {
    yearItem = yearList.value[0] || null
    if (yearItem) {
      selectYear.value = yearItem.year || null
    }
  }
  // 校验季度是否存在
  if (yearItem) {
    const seasonItem = yearItem.seasonList.find((item) => item === querySeason)
    if (seasonItem) {
      selectSeason.value = querySeason
    } else {
      selectSeason.value = yearItem.seasonList[0] || null
    }
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
    if (Object.keys(newQuery).length > 0) {
      router.replace({ query: { ...route.query, ...newQuery } })
    }
  }
}
initYearSeason()
// 如果年份和季度都存在，就获取番剧列表
const bangumiList = ref([])
if (selectYear.value && selectSeason.value) {
  const params = {
    year: selectYear.value,
    season: selectSeason.value,
  }
  await getBangumiListApi(params).then((res) => {
    bangumiList.value = res.data.value.data
  })
}

const bangumiLoading = ref(false)
const fetchBangumiList = async () => {
  const params = {
    year: selectYear.value,
    season: selectSeason.value,
  }
  bangumiLoading.value = true
  const res = await getBangumiListApi(params)
    .then((res) => {
      const query = {
        year: selectYear.value,
        season: selectSeason.value,
      }
      const nowQuery = route.query
      router.replace({ query: { ...nowQuery, ...query } })
      return res
    })
    .catch(() => {
      return null
    })
  bangumiList.value = res?.data?.value?.data || []
  bangumiLoading.value = false
}
// 选择了年份
const selectYearHandle = async (year, close) => {
  if (close) close()
  selectYear.value = year
  selectSeason.value = selectSeasonList.value[0]
  await fetchBangumiList()
}
// 选择了季度
const selectSeasonHandle = async (season, close) => {
  if (close) close()
  selectSeason.value = season
  await fetchBangumiList()
}
</script>
<style scoped></style>
