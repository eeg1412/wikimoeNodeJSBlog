<template>
  <div class="pt-2 pb-2 page-game-body">
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
    </div>
    <div class="relative">
      <!-- 追番列表 -->
      <div v-if="gameList.length > 0" class="mt-5">
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="game in gameList" :key="game.id" class="flex">
            <div class="flex-shrink-0 relative game-cover-body">
              <div class="relative">
                <WikimoeImage
                  class="w-full rounded game-cover"
                  :src="game.cover || '/img/nopic400-565.png'"
                  :alt="game.title"
                  :width="400"
                  :height="565"
                  :data-href="game.cover"
                  :data-href-list="
                    game.cover ? setDataHrefList(game.cover) : null
                  "
                  loading="lazy"
                  fit="cover"
                />
                <div class="absolute bottom-0 left-0 p-1">
                  <UBadge
                    v-for="(label, index) in game.label"
                    :key="index"
                    size="xs"
                    class="mr-1"
                  >
                    {{ label }}
                  </UBadge>
                </div>
              </div>
              <div class="mt-2">
                <div
                  v-if="game.rating"
                  class="text-sm mb-1 text-primary border border-solid border-primary-400 text-center rounded"
                >
                  <span>{{ game.rating }}</span
                  >分 | {{ ratingToText(game.rating) }}
                </div>
                <div
                  v-else
                  class="text-sm mb-1 text-primary border border-solid border-primary-400 text-center rounded"
                >
                  暂无评分
                </div>
              </div>
            </div>
            <div class="pl-3 w-full flex flex-col">
              <div class="font-bold mb-1 line-clamp-2 flex-shrink-0">
                <span
                  class="games-platform-block"
                  :style="{
                    backgroundColor: '#ff4d4f',
                  }"
                  >NS</span
                >{{ game.title }}
              </div>
              <!-- 链接 -->
              <div class="text-sm mb-1 text-gray-500 flex-shrink-0">
                <a
                  href="www.bilibili.com"
                  target="_blank"
                  class="inline-flex items-center text-primary mr-2"
                >
                  <UIcon name="i-heroicons-link" class="align-middle mr-1" />
                  录像视频
                </a>
                <a
                  href="www.bilibili.com"
                  target="_blank"
                  class="inline-flex items-center text-primary mr-2"
                >
                  <UIcon name="i-heroicons-photo" class="align-middle mr-1" />
                  游戏截图
                </a>
              </div>
              <!-- 用时 -->
              <div class="text-sm mb-1 text-gray-500 flex-shrink-0">
                已用时：100分钟
              </div>
              <!-- prettier-ignore -->
              <div class="text-sm whitespace-pre-line text-gray-500 flex-grow" v-if="game.summary">{{ game.summary }}</div>
              <div v-else class="text-sm flex-grow text-gray-400">暂无简评</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <Empty />
      </div>
      <DivLoading :loading="gameLoading" />
    </div>
    <div class="p-2" v-if="total > 0">
      共计追番<span class="text-primary pl-1 pr-1">{{ total }}</span
      >部，当前季度追番<span class="text-primary pl-1 pr-1">{{
        gameList.length
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
  const lastYear = yearList.value[0] || null
  if (lastYear) {
    selectYear.value = lastYear.year || null
    selectSeason.value =
      lastYear.seasonList[lastYear.seasonList.length - 1] || null
  }
}
initYearSeason()
// 如果年份和季度都存在，就获取番剧列表
const gameList = ref([])
if (selectYear.value && selectSeason.value) {
  const params = {
    year: selectYear.value,
    season: selectSeason.value,
  }
  await getBangumiListApi(params).then((res) => {
    gameList.value = res.data.value.data
  })
}
const seasonToName = (season) => {
  switch (season) {
    case 1:
      return '冬季新番'
    case 2:
      return '春季新番'
    case 3:
      return '夏季新番'
    case 4:
      return '秋季新番'
    default:
      return ''
  }
}
const setDataHrefList = (cover) => {
  return [
    {
      src: cover,
      width: 400,
      height: 565,
    },
  ]
}
// 评分转文字
const ratingToText = (rating) => {
  if (rating >= 90) return '神作'
  if (rating >= 80) return '佳作'
  if (rating >= 70) return '良作'
  if (rating >= 60) return '还行'
  if (rating >= 50) return '劣作'
  if (rating >= 40) return '差'
  if (rating >= 30) return '烂作'
  if (rating >= 20) return '烂差'
  if (rating >= 10) return '迷'
  return '暂无评分'
}

const gameLoading = ref(false)
const fetchBangumiList = async () => {
  const params = {
    year: selectYear.value,
    season: selectSeason.value,
  }
  gameLoading.value = true
  const res = await getBangumiListApi(params)
  gameList.value = res?.data?.value?.data || []
  gameLoading.value = false
}
// 选择了年份
const selectYearHandle = async (year, close) => {
  if (close) close()
  selectYear.value = year
  selectSeason.value = selectSeasonList.value[0]
  await fetchBangumiList()
}
</script>
<style>
.page-game-body .game-cover {
  height: auto;
  width: 100%;
}
</style>
<style scoped>
.game-cover-body {
  width: 100px;
}
.games-platform-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
}
/* 手机 */
@media (max-width: 768px) {
  .game-cover-body {
    width: 100px;
  }
}
</style>
