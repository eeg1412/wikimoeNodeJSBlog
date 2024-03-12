<template>
  <div class="pt-2 pb-2 page-game-body">
    <div class="flex items-center">
      <!-- 顶部年份季度选择 -->
      <UPopover :popper="{ arrow: true }">
        <UButton
          :label="`${selectPlatformData.name}`"
          size="sm"
          variant="soft"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          class="mr-3"
        />

        <template #panel="{ close }">
          <div class="p-4 w-60 max-h-96 overflow-auto">
            <!-- 平台选择器 -->
            <div class="flex flex-wrap">
              <div class="p-2 mr-1 mb-1">
                <UButton
                  label="全部平台"
                  size="sm"
                  :variant="selectPlatformData._id === null ? 'solid' : 'ghost'"
                  @click="
                    selectPlatform({ name: '全部平台', _id: null }, close)
                  "
                />
              </div>
              <div
                v-for="item in gamePlatformList"
                :key="item._id"
                class="p-2 mr-1 mb-1"
              >
                <UButton
                  :label="`${item.name}`"
                  size="sm"
                  :variant="
                    item._id === selectPlatformData._id ? 'solid' : 'ghost'
                  "
                  @click="selectPlatform(item, close)"
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
          <div class="p-4 w-80 max-h-96 overflow-auto">
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
      <div v-if="gameList.length > 0" class="mt-5">
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="game in gameList"
            :key="game.id"
            class="flex border-b border-gray-200 border-dashed pb-3 mb-3"
          >
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
                    backgroundColor: game.gamePlatform.color,
                  }"
                  v-if="game.gamePlatform"
                  >{{ game.gamePlatform.name }}</span
                >{{ game.title }}
              </div>
              <!-- 链接 -->
              <div class="text-sm mb-1 text-gray-500 flex-shrink-0">
                <a
                  :href="url.url"
                  target="_blank"
                  class="inline-flex items-center text-primary mr-2"
                  v-for="(url, index) in game.urlList"
                  :key="index"
                >
                  <UIcon name="i-heroicons-link" class="align-middle mr-1" />
                  {{ url.text }}
                </a>
                <a
                  href="javascript:;"
                  class="inline-flex items-center text-primary mr-2"
                  v-if="game.screenshotAlbum"
                >
                  <UIcon name="i-heroicons-photo" class="align-middle mr-1" />
                  游戏截图
                </a>
              </div>
              <!-- 用时 -->
              <UPopover
                :popper="{ offsetDistance: 0, placement: 'bottom-start' }"
                v-if="game.startTime"
              >
                <div
                  class="text-sm mb-1 text-gray-400 flex-shrink-0 pointer w_10 flex items-center"
                >
                  <UIcon
                    name="i-heroicons-clock"
                    class="align-middle mr-1"
                  />用时{{ getACGDuration(game.startTime, game.endTime) }}
                </div>
                <template #panel>
                  <div class="px-2 py-1">
                    {{
                      `${formatDate(game.startTime)} ~ ${
                        game.endTime ? formatDate(game.endTime) : '至今'
                      }`
                    }}
                  </div>
                </template>
              </UPopover>

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
    <div class="p-2 flex justify-between items-center" v-if="total > 0">
      <div>
        共<span class="text-primary pl-1 pr-1">{{ total }}</span
        >部游戏
      </div>
      <div>
        <UButton
          icon="i-heroicons-chevron-left"
          size="2xs"
          color="primary"
          square
          variant="outline"
          class="mr-1"
          :disabled="!hasPrev"
          @click="toPrev"
        />
        <UButton
          icon="i-heroicons-chevron-right"
          size="2xs"
          color="primary"
          square
          variant="outline"
          :disabled="!hasNext"
          @click="toNext"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { getGameListApi, getGamePlatformListApi } from '@/api/game'

// 平台
const gamePlatformList = ref([])
const selectPlatformData = ref({
  name: '全部平台',
  _id: null,
})

// 游戏列表
const size = 20
const params = reactive({
  page: 1,
  sortType: 'startTime',
})
const gameList = ref([])
const total = ref(0)

// 获取数据
await Promise.all([
  getGamePlatformListApi().then((res) => {
    gamePlatformList.value = res.data.value.data
  }),
  getGameListApi(params).then((res) => {
    gameList.value = res.data.value.list
    total.value = res.data.value.total
  }),
])
const hasPrev = computed(() => params.page > 1)
const hasNext = computed(() => params.page * size < total.value)

const setDataHrefList = (cover) => {
  return [
    {
      src: cover,
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
const listRef = ref(null)
const fetchGameList = async () => {
  gameLoading.value = true
  const newParams = {
    ...params,
    gamePlatformId: selectPlatformData.value?._id,
  }
  const res = await getGameListApi(newParams)
  gameList.value = res?.data?.value?.list || []
  total.value = res?.data?.value?.total || 0
  gameLoading.value = false
  nextTick(() => {
    if (listRef.value) {
      const rect = listRef.value.getBoundingClientRect()
      window.scrollBy({
        top: rect.top - 200,
        behavior: 'smooth',
      })
    }
  })
}
const toPrev = () => {
  if (hasPrev.value) {
    params.page--
    fetchGameList()
  }
}
const toNext = () => {
  if (hasNext.value) {
    params.page++
    fetchGameList()
  }
}

const selectPlatform = (item, close) => {
  selectPlatformData.value = item
  params.page = 1
  fetchGameList()
  close()
}

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
  fetchGameList()
  close()
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
</style>
