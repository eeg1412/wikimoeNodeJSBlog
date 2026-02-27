<template>
  <ClientOnly>
    <WUIModal v-model="isOpen">
      <div class="series-dialog-body">
        <DivLoading class="!z-20" :loading="loading" />
        <!-- 头部 -->
        <div
          class="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ seriesData?.name || '系列详情' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 common-focus-visible-btn-outline rounded"
            @click="close"
          >
            <WUIIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- 别名 & 简介 -->
        <div
          class="px-4 flex-shrink-0 space-y-2"
          v-if="
            seriesData && (seriesData.alias?.length > 0 || seriesData.summary)
          "
        >
          <!-- 别名：标签形式 -->
          <div
            v-if="seriesData.alias?.length > 0"
            class="flex flex-wrap items-center gap-1.5"
          >
            <span
              class="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0"
              >别名</span
            >
            <WUIBadge
              v-for="(alias, i) in seriesData.alias"
              :key="i"
              color="white"
              size="xs"
              >{{ alias }}</WUIBadge
            >
          </div>
          <!-- 简介 -->
          <div
            v-if="seriesData.summary"
            class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed rounded-lg"
          >
            {{ seriesData.summary }}
          </div>
        </div>

        <!-- 分割线 -->
        <div
          class="border-t border-solid border-gray-200/60 dark:border-gray-700/50 my-2"
        ></div>

        <!-- Tabs + 列表内容（同一滚动容器，Tabs sticky，保证宽度一致） -->
        <div
          class="flex-grow overflow-y-auto series-dialog-content custom-scroll scroll-not-hide relative [scrollbar-gutter:stable_both-edges]"
          v-if="visibleTabs.length > 0"
          ref="contentBody"
        >
          <!-- Sticky Tabs -->
          <div
            class="px-3 sticky top-0 z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800"
          >
            <WUITabs v-model="activeTab" :items="visibleTabs" />
          </div>

          <!-- 列表 -->
          <div class="px-3 pb-4">
            <div
              v-if="!loading && hasError"
              class="py-8 text-center text-gray-400"
            >
              获取失败，请稍后重试
            </div>
            <div
              v-else-if="!loading && itemList.length === 0"
              class="py-8 text-center text-gray-400"
            >
              暂无内容
            </div>
            <div v-else>
              <div
                v-for="item in itemList"
                :key="item._id"
                class="py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <BangumiItem
                  v-if="loadedType === 'bangumi'"
                  :bangumi="item"
                  :enableSummaryToggle="true"
                  :summaryToggleThreshold="80"
                  :showSeries="false"
                />
                <MovieItem
                  v-else-if="loadedType === 'movie'"
                  :movie="item"
                  :enableSummaryToggle="true"
                  :summaryToggleThreshold="80"
                  :showSeries="false"
                />
                <BookItem
                  v-else-if="loadedType === 'book'"
                  :book="item"
                  :enableSummaryToggle="true"
                  :summaryToggleThreshold="80"
                  :showAnimeDot="false"
                  :showSeries="false"
                />
                <GameItem
                  v-else-if="loadedType === 'game'"
                  :game="item"
                  :enableSummaryToggle="true"
                  :summaryToggleThreshold="80"
                  :showAnimeDot="false"
                  :showSeries="false"
                />
              </div>
            </div>
            <!-- 分页 -->
            <div class="flex justify-center pt-3" v-if="totalPages > 1">
              <WUIPagination
                v-model="currentPage"
                :total="total"
                :page-count="pageSize"
                :max="5"
              />
            </div>
          </div>
        </div>
      </div>
    </WUIModal>
  </ClientOnly>
</template>

<script setup>
import {
  getAcgnSeriesDetailApiFetch,
  getAcgnSeriesItemsApiFetch
} from '~/api/acgnSeries'

const { add: addToast } = useWToast()

const props = defineProps({
  seriesId: {
    type: String,
    default: ''
  }
})

const isOpen = ref(false)
const activeSeriesId = ref('')
const seriesData = ref(null)
const countsData = ref(null)
const loading = ref(false)
const hasError = ref(false)
const activeTab = ref(0)
const itemList = ref([])
const loadedType = ref('')
const currentPage = ref(1)
const total = ref(0)
const pageSize = 5
const contentBody = ref(null)

// 类型配置
const typeConfig = [
  { key: 'bangumi', label: '番剧' },
  { key: 'movie', label: '电影' },
  { key: 'book', label: '书籍' },
  { key: 'game', label: '游戏' }
]

// 只显示有数据的 tab
const visibleTabs = computed(() => {
  if (!countsData.value) {
    return []
  }
  return typeConfig
    .filter(tc => (countsData.value[tc.key] || 0) > 0)
    .map(tc => ({
      label: `${tc.label}`,
      key: tc.key
    }))
})

// 当前选中的类型 key
const currentType = computed(() => {
  if (visibleTabs.value.length === 0) {
    return ''
  }
  return visibleTabs.value[activeTab.value]?.key || ''
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize))
})

/**
 * 获取系列详情
 */
const fetchDetail = async () => {
  if (!activeSeriesId.value) {
    return false
  }
  try {
    const res = await getAcgnSeriesDetailApiFetch({ id: activeSeriesId.value })
    seriesData.value = res.data.series
    countsData.value = res.data.counts
    return true
  } catch (err) {
    console.error('获取系列详情失败', err)
    addToast({
      title: '获取失败',
      description: '系列详情获取失败，请稍后重试',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle'
    })
    return false
  }
}

/**
 * 获取系列下的项目列表
 */
const fetchItems = async () => {
  if (!activeSeriesId.value || !currentType.value) {
    return
  }
  loading.value = true
  hasError.value = false
  try {
    const res = await getAcgnSeriesItemsApiFetch({
      seriesId: activeSeriesId.value,
      type: currentType.value,
      page: currentPage.value
    })
    itemList.value = res.data.list || []
    total.value = res.data.total || 0
    loadedType.value = currentType.value
    nextTick(() => {
      if (contentBody.value) {
        // smooth scroll to top after loading data, only if not already at top
        if (contentBody.value.scrollTop > 0) {
          contentBody.value.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    })
  } catch (err) {
    console.error('获取系列项目失败', err)
    hasError.value = true
    itemList.value = []
    total.value = 0
    addToast({
      title: '获取失败',
      description: '系列内容获取失败，请稍后重试',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    loading.value = false
  }
}

// 切换 tab 时重新加载
watch(activeTab, () => {
  currentPage.value = 1
  hasError.value = false
  fetchItems()
})

// 翻页时重新加载
watch(currentPage, () => {
  fetchItems()
})

/**
 * 打开对话框（先加载数据再弹出，避免抖动）
 * @param {string} [id] - 系列ID，不传则使用 seriesId prop
 */
const open = async id => {
  activeSeriesId.value = id || props.seriesId
  activeTab.value = 0
  currentPage.value = 1
  itemList.value = []
  loadedType.value = ''
  total.value = 0
  hasError.value = false
  seriesData.value = null
  countsData.value = null
  const success = await fetchDetail()
  if (!success) {
    return
  }
  isOpen.value = true
  if (visibleTabs.value.length > 0) {
    fetchItems()
  }
}

const close = () => {
  isOpen.value = false
}

defineExpose({ open, close })
</script>

<style scoped>
.series-dialog-body {
  display: flex;
  flex-direction: column;
  height: 80dvh;
}
</style>
