<template>
  <div class="bangumi-selector-container" style="width: 100%">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="content-selector-wrapper">
      <el-select
        v-model="selectedBangumis"
        multiple
        filterable
        remote
        :remote-method="queryBangumis"
        :automatic-dropdown="true"
        default-first-option
        :reserve-keyword="false"
        :loading="loading"
        :placeholder="placeholder"
        style="width: 100%"
        ref="bangumiSelectRef"
      >
        <template #header>
          <el-radio-group
            v-model="statusFilter"
            @change="queryBangumis(lastKeyword)"
            :disabled="loading"
          >
            <el-radio :label="undefined" size="small">全部</el-radio>
            <el-radio :label="0" size="small">仅不显示</el-radio>
            <el-radio :label="1" size="small">仅显示</el-radio>
          </el-radio-group>
        </template>
        <el-option
          v-for="item in bangumiOptions"
          :key="item._id"
          :label="item.label"
          :value="item._id"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedBangumis.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="content-selector-wrapper">
      <DraggableSelector
        v-model="selectedBangumis"
        :options="tagList"
        :placeholder="placeholder"
        value-key="value"
        label-key="currentLabel"
        @change="handleSortChange"
      />

      <div class="content-selector-yes-no-wrapper">
        <!-- 完成排序按钮 -->
        <div class="content-selector-yes-no-wrapper-item">
          <el-button
            type="success"
            :icon="Check"
            size="default"
            @click="toggleSortMode"
            title="完成排序"
          />
        </div>

        <div class="content-selector-yes-no-wrapper-item">
          <!-- 取消排序按钮 -->
          <el-button
            :icon="Close"
            size="default"
            @click="cancelSort"
            title="取消排序"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Sort, Check, Close } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import { seasonToStr } from '@/utils/utils'
import DraggableSelector from './DraggableSelector.vue'
import { formatDate, limitStr } from '@/utils/utils'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  bangumiList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择番剧'
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:bangumiList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const bangumiSelectRef = ref(null)
const getSelectedList = () => {
  return bangumiSelectRef.value?.showTagList || []
}

const bangumiOptions = computed(() => {
  if (props.bangumiList && Array.isArray(props.bangumiList)) {
    props.bangumiList.forEach(bangumi => {
      let label = `${checkShowText(bangumi)}【${bangumi.year}年${seasonToStr(
        bangumi.season
      )}季新番】${bangumi.title}`
      bangumi.label = label
    })
    return props.bangumiList
  }
  return []
})
const selectedBangumis = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 检查显示文本
const checkShowText = item => {
  if (item.status === 0) {
    return '【状态:不显示】'
  }
  return ''
}

const lastKeyword = ref(null)
const statusFilter = ref(undefined) // 0:不显示,1:显示

// 获取番剧列表
const getBangumiList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  lastKeyword.value = keyword
  authApi
    .getBangumiList(
      { keyword, status: statusFilter.value, size: 50, page: 1 },
      true
    )
    .then(res => {
      emit('update:bangumiList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索番剧
let queryBangumisTimer = null
const queryBangumis = query => {
  if (queryBangumisTimer) {
    clearTimeout(queryBangumisTimer)
  }
  queryBangumisTimer = setTimeout(() => {
    getBangumiList(query)
  }, 100)
}

// 切换排序模式
const tagList = ref([])
const toggleSortMode = () => {
  if (!isSortMode.value) {
    // 进入排序模式，保存原始顺序
    originalOrder.value = [...props.modelValue]
    tagList.value = getSelectedList()
  }
  isSortMode.value = !isSortMode.value
}

// 取消排序，恢复原始顺序
const cancelSort = () => {
  emit('update:modelValue', originalOrder.value)
  isSortMode.value = false
}

// 处理排序变化
const handleSortChange = newOrder => {
  emit('update:modelValue', newOrder)
}
</script>

<style scoped>
.bangumi-selector-container {
  display: inline-block;
}
</style>
