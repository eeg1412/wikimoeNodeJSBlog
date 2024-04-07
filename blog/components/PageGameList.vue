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
      <div v-if="gameList.length > 0" class="mt-5">
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="game in gameList" :key="game.id" class="mb-1">
            <GameItem :game="game" />
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
<style scoped></style>
