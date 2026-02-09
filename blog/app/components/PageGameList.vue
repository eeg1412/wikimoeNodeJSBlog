<template>
  <div class="pt-2 pb-2 page-game-body">
    <div class="flex items-center">
      <div class="mr-3 acgn-filter-popover">
        <WUIPopover :popper="{ arrow: true }" v-model:open="filterOpen">
          <WUIButton
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
                  <WUIInput
                    v-model.trim="filterCache.keyword"
                    @keydown.enter="applyFilters(close)"
                    size="sm"
                    maxlength="20"
                    placeholder="请输入关键词"
                  >
                    <template #trailing>
                      <WUIButton
                        v-show="filterCache.keyword"
                        color="gray"
                        variant="link"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        @click="filterCache.keyword = undefined"
                      />
                    </template>
                  </WUIInput>
                </div>

                <!-- 类型选择器 -->
                <div class="mb-2">
                  <div class="text-sm font-medium mb-1">平台</div>
                  <div class="flex flex-wrap">
                    <div class="mr-1 mb-1">
                      <WUIButton
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
                      :key="item._id || -1"
                      class="mr-1 mb-1"
                    >
                      <WUIButton
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
                      :key="status.value || -1"
                      class="mr-1 mb-1"
                    >
                      <WUIButton
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
                <WUIButton
                  label="取消"
                  size="sm"
                  variant="ghost"
                  class="mr-2"
                  @click="close"
                />
                <!-- 筛选 -->
                <WUIButton
                  label="筛选"
                  size="sm"
                  variant="solid"
                  color="primary"
                  :loading="gameLoading"
                  @click="applyFilters(close)"
                />
              </div>
            </div>
          </template>
        </WUIPopover>
      </div>

      <WUIPopover :popper="{ arrow: true }">
        <WUIButton
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
                <WUIButton
                  :label="item.label"
                  size="2xs"
                  :variant="params.sortType === item.value ? 'solid' : 'ghost'"
                  @click="selectType(item.value, close)"
                />
              </div>
            </div>
          </div>
        </template>
      </WUIPopover>
    </div>
    <div class="relative" ref="listRef">
      <!-- 列表 -->
      <div v-if="gameList.length > 0" class="mt-5">
        <div class="grid gap-2">
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
        <WUIButton
          icon="i-heroicons-chevron-left"
          size="2xs"
          color="primary"
          square
          variant="outline"
          class="mr-1"
          :disabled="!hasPrev"
          @click="toPrev"
        />
        <WUIButton
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
import {
  getGameListApi,
  getGameListApiFetch,
  getGamePlatformListApi
} from '@/api/game'
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

// 平台
const gamePlatformList = ref([])
const selectPlatformData = ref({
  name: '全部平台',
  _id: undefined
})
await getGamePlatformListApi().then(res => {
  gamePlatformList.value = res.data.value.data
})

// 游戏列表
const size = 20
const rawQuery = {
  page: 1,
  sortType: 'startTime',
  gamePlatformId: undefined,
  status: undefined,
  keyword: undefined
}
const params = computed(() => {
  const routeQuery = JSON.parse(JSON.stringify(route.query))
  const numberKey = ['page', 'status']
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

const statusList = [
  {
    label: '全部',
    value: undefined
  },
  {
    label: '尚未攻略',
    value: 1
  },
  {
    label: '攻略中',
    value: 2
  },
  {
    label: '已通关',
    value: 3
  },
  {
    label: '弃坑',
    value: 99
  }
]

const sortTypeMap = {
  startTime: '按开始时间排序',
  rating: '按评分排序'
}
const sortTypeList = [
  {
    label: '按开始时间排序',
    value: 'startTime'
  },
  {
    label: '按评分排序',
    value: 'rating'
  }
]
const selectType = (type, close) => {
  if (gameLoading.value) return
  setRouterQuery({
    sortType: type
  })
  close()
}

const checkedParams = {
  ...rawQuery
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
    checkedParams.page = Number(queryPage)
  }
  // sortType必须是sortTypeList里的
  if (sortTypeList.find(item => item.value === querySortType)) {
    checkedParams.sortType = querySortType
  }
  // gamePlatformId必须是isObjectId
  if (queryGamePlatformId && isObjectId(queryGamePlatformId)) {
    // 检查queryGamePlatformId是否在gamePlatformList里
    const gamePlatform = gamePlatformList.value.find(
      item => item._id === queryGamePlatformId
    )
    if (gamePlatform) {
      selectPlatformData.value = gamePlatform
      checkedParams.gamePlatformId = queryGamePlatformId
    }
  }

  if (queryStatus && statusList.some(item => item.value === queryStatus)) {
    checkedParams.status = queryStatus
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

const gameList = ref([])
const total = ref(0)

// 获取数据
await getGameListApi(checkedParams).then(res => {
  gameList.value = res.data.value.list
  total.value = res.data.value.total
})
const hasPrev = computed(() => params.value.page > 1)
const hasNext = computed(() => params.value.page * size < total.value)

const gameLoading = ref(false)
const listRef = ref(null)
const fetchGameList = async () => {
  gameLoading.value = true
  const newParams = {
    ...params.value
  }
  const res = await getGameListApiFetch(newParams)
  gameList.value = res?.list || []
  total.value = res?.total || 0
  gameLoading.value = false
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

const selectPlatform = (item, close) => {
  selectPlatformData.value = item
  filterCache.gamePlatformId = item?._id
}

const filterOpen = ref(false)
const filterCache = reactive({
  gamePlatformId: params.value.gamePlatformId,
  status: params.value.status,
  keyword: params.value.keyword
})
const filterCount = computed(() => {
  let count = 0
  if (params.value.gamePlatformId) {
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
    filterCache.gamePlatformId = params.value.gamePlatformId
    filterCache.status = params.value.status
    filterCache.keyword = params.value.keyword
  }
})
// 添加一个方法，用于同时应用年份和季度筛选
const applyFilters = async close => {
  if (close) close()
  setRouterQuery({
    gamePlatformId: filterCache.gamePlatformId,
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
      fetchGameList()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    // 如果gameList为0，且page不为1，则重新获取数据
    if (gameList.value.length === 0 && params.page > 1) {
      console.log('重新获取数据')
      setRouterQuery({
        page: 1
      })
    }
    hash = undefined
  })
})
</script>
<style scoped></style>
