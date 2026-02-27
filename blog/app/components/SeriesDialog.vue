<template>
  <ClientOnly>
    <WUIModal v-model="isOpen">
      <div class="series-dialog-body">
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
          class="px-4 py-2 flex-shrink-0"
          v-if="
            seriesData && (seriesData.alias?.length > 0 || seriesData.summary)
          "
        >
          <div
            class="text-sm text-gray-500 dark:text-gray-400 mb-1"
            v-if="seriesData.alias?.length > 0"
          >
            别名：{{ seriesData.alias.join('、') }}
          </div>
          <div
            class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line"
            v-if="seriesData.summary"
          >
            {{ seriesData.summary }}
          </div>
        </div>

        <!-- Tabs -->
        <div class="px-4 pt-2 flex-shrink-0" v-if="visibleTabs.length > 0">
          <WUITabs v-model="activeTab" :items="visibleTabs">
            <template #default="{ selected }">
              <!-- 内容区域 -->
            </template>
          </WUITabs>
        </div>

        <!-- 列表内容 -->
        <div
          class="px-4 pb-4 overflow-y-auto flex-grow series-dialog-content"
          v-if="visibleTabs.length > 0"
        >
          <div v-if="loading" class="py-8 text-center text-gray-400">
            加载中...
          </div>
          <div
            v-else-if="itemList.length === 0"
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
              <ACGNItem
                :item="item"
                :badge="getBadge(item)"
                :type="currentType"
                :enableSummaryToggle="true"
                :summaryToggleThreshold="80"
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

        <div class="px-4 py-8 text-center text-gray-400" v-if="detailLoading">
          加载中...
        </div>
      </div>
    </WUIModal>
  </ClientOnly>
</template>

<script setup>
import { getAcgnSeriesDetailApi, getAcgnSeriesItemsApi } from '~/api/acgnSeries'

const props = defineProps({
  seriesId: {
    type: String,
    default: ''
  }
})

const isOpen = ref(false)
const seriesData = ref(null)
const countsData = ref(null)
const detailLoading = ref(false)
const loading = ref(false)
const activeTab = ref(0)
const itemList = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = 5

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
      label: `${tc.label} (${countsData.value[tc.key]})`,
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
 * 获取 badge（平台/类型）
 */
const getBadge = item => {
  if (currentType.value === 'book' && item.booktype) {
    return { name: item.booktype.name, color: item.booktype.color }
  }
  if (currentType.value === 'game' && item.gamePlatform) {
    return { name: item.gamePlatform.name, color: item.gamePlatform.color }
  }
  return null
}

/**
 * 获取系列详情
 */
const fetchDetail = async () => {
  if (!props.seriesId) {
    return
  }
  detailLoading.value = true
  try {
    const res = await getAcgnSeriesDetailApi({ id: props.seriesId })
    seriesData.value = res.data.value.data.series
    countsData.value = res.data.value.data.counts
  } catch (err) {
    console.error('获取系列详情失败', err)
  } finally {
    detailLoading.value = false
  }
}

/**
 * 获取系列下的项目列表
 */
const fetchItems = async () => {
  if (!props.seriesId || !currentType.value) {
    return
  }
  loading.value = true
  try {
    const res = await getAcgnSeriesItemsApi({
      seriesId: props.seriesId,
      type: currentType.value,
      page: currentPage.value
    })
    itemList.value = res.data.value.data.list || []
    total.value = res.data.value.data.total || 0
  } catch (err) {
    console.error('获取系列项目失败', err)
    itemList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 切换 tab 时重新加载
watch(activeTab, () => {
  currentPage.value = 1
  itemList.value = []
  total.value = 0
  fetchItems()
})

// 翻页时重新加载
watch(currentPage, () => {
  fetchItems()
})

/**
 * 打开对话框
 */
const open = async () => {
  isOpen.value = true
  activeTab.value = 0
  currentPage.value = 1
  itemList.value = []
  total.value = 0
  seriesData.value = null
  countsData.value = null
  await fetchDetail()
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
  max-height: 80dvh;
}
.series-dialog-content {
  min-height: 100px;
}
</style>
