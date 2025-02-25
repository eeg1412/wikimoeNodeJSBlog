<template>
  <div class="pt-2 pb-2 page-game-body">
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

                <!-- 类型选择器 -->
                <div class="mb-2">
                  <div class="text-sm font-medium mb-1">类型</div>
                  <div class="flex flex-wrap">
                    <div class="mr-1 mb-1">
                      <UButton
                        label="全部平台"
                        size="2xs"
                        :variant="
                          filterCache.gamePlatformId === undefined
                            ? 'solid'
                            : 'ghost'
                        "
                        @click="
                          selectPlatform(
                            { name: '全部平台', _id: undefined },
                            close
                          )
                        "
                      />
                    </div>
                    <div
                      v-for="item in gamePlatformList"
                      :key="item._id"
                      class="mr-1 mb-1"
                    >
                      <UButton
                        :label="`${item.name}`"
                        size="2xs"
                        :variant="
                          item._id === filterCache.gamePlatformId
                            ? 'solid'
                            : 'ghost'
                        "
                        @click="selectPlatform(item, close)"
                      />
                    </div>
                  </div>
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
      <div v-if="gameList.length > 0" class="mt-5">
        <div class="grid gap-4 xl:grid-cols-2">
          <div v-for="game in gameList" :key="game._id" class="mb-1">
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
  getGameListApi,
  getGameListApiFetch,
  getGamePlatformListApi,
} from '@/api/game'
const route = useRoute()
const router = useRouter()

// 平台
const gamePlatformList = ref([])
const selectPlatformData = ref({
  name: '全部平台',
  _id: undefined,
})
await getGamePlatformListApi().then((res) => {
  gamePlatformList.value = res.data.value.data
})

// 游戏列表
const size = 20
const params = reactive({
  page: 1,
  sortType: 'startTime',
  gamePlatformId: undefined,
  status: undefined,
  keyword: '',
})

const statusList = [
  {
    label: '全部',
    value: undefined,
  },
  {
    label: '尚未攻略',
    value: 1,
  },
  {
    label: '攻略中',
    value: 2,
  },
  {
    label: '已通关',
    value: 3,
  },
  {
    label: '弃坑',
    value: 99,
  },
]

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

const initParams = () => {
  // page必须是数字，sortType必须是sortTypeList，gamePlatformId必须是isObjectId
  const queryPage = route.query.page
    ? Math.abs(parseInt(route.query.page, 10))
    : null
  const querySortType = route.query.sortType
  const queryGamePlatformId = route.query.gamePlatformId
  const queryStatus = route.query.status
    ? Number(route.query.status)
    : undefined
  const queryKeyword = route.query.keyword
  // page必须是数字
  if (queryPage && !isNaN(queryPage)) {
    params.page = queryPage
  }
  // sortType必须是sortTypeList里的
  if (sortTypeList.find((item) => item.value === querySortType)) {
    params.sortType = querySortType
  }
  // gamePlatformId必须是isObjectId
  if (queryGamePlatformId && isObjectId(queryGamePlatformId)) {
    // 检查queryGamePlatformId是否在gamePlatformList里
    const gamePlatform = gamePlatformList.value.find(
      (item) => item._id === queryGamePlatformId
    )
    if (gamePlatform) {
      selectPlatformData.value = gamePlatform
      params.gamePlatformId = queryGamePlatformId
    }
  }

  if (queryStatus && statusList.some((item) => item.value === queryStatus)) {
    params.status = queryStatus
  }

  if (queryKeyword && queryKeyword.length <= 20) {
    params.keyword = queryKeyword
  }

  if (
    import.meta.client &&
    (queryPage ||
      querySortType ||
      queryGamePlatformId ||
      queryStatus ||
      queryKeyword)
  ) {
    router.replace({
      query: {
        ...route.query,
        ...params,
      },
      hash: route.hash,
    })
  }
}
initParams()

const gameList = ref([])
const total = ref(0)

// 获取数据
await Promise.all([
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
  }
  const res = await getGameListApiFetch(newParams)
  gameList.value = res?.list || []
  total.value = res?.total || 0
  gameLoading.value = false
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
  filterCache.gamePlatformId = item?._id
}

const filterOpen = ref(false)
const filterCache = reactive({
  gamePlatformId: params.gamePlatformId,
  status: params.status,
  keyword: params.keyword,
})
const filterCount = computed(() => {
  let count = 0
  if (params.gamePlatformId) {
    count++
  }
  if (params.status) {
    count++
  }
  if (params.keyword) {
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
    filterCache.gamePlatformId = params.gamePlatformId
    filterCache.status = params.status
    filterCache.keyword = params.keyword
  }
})
// 添加一个方法，用于同时应用年份和季度筛选
const applyFilters = async (close) => {
  if (close) close()
  params.gamePlatformId = filterCache.gamePlatformId
  params.status = filterCache.status
  params.keyword = filterCache.keyword
  params.page = 1
  fetchGameList()
}

onMounted(() => {
  nextTick(() => {
    // 如果gameList为0，且page不为1，则重新获取数据
    if (gameList.value.length === 0 && params.page > 1) {
      console.log('重新获取数据')
      params.page = 1
      fetchGameList()
    }
  })
})
</script>
<style scoped></style>
