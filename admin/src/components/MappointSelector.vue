<template>
  <div class="mappoint-selector-container" :style="{ width: width }">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="mappoint-selector-wrapper">
      <el-select
        v-model="selectedMappoints"
        multiple
        clearable
        filterable
        remote
        :remote-method="queryMappoints"
        :automatic-dropdown="true"
        default-first-option
        :reserve-keyword="false"
        :loading="loading"
        style="width: 100%"
        :placeholder="placeholder"
        ref="mappointSelectorRef"
      >
        <template #header>
          <el-radio-group
            v-model="statusFilter"
            @change="queryMappoints(lastKeyword)"
            :disabled="loading"
          >
            <el-radio :label="undefined" size="small">全部</el-radio>
            <el-radio :label="0" size="small">仅不显示</el-radio>
            <el-radio :label="1" size="small">仅显示</el-radio>
          </el-radio-group>
        </template>
        <el-option
          v-for="item in mappointOptions"
          :key="item._id"
          :label="item.label"
          :value="item._id"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedMappoints.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="mappoint-sort-wrapper">
      <DraggableSelector
        v-model="selectedMappoints"
        :options="tagList"
        :placeholder="placeholder"
        :width="sortable ? 'calc(100% - 80px)' : '100%'"
        value-key="value"
        label-key="currentLabel"
        @change="handleSortChange"
      />

      <!-- 完成排序按钮 -->
      <div>
        <el-button
          type="success"
          :icon="Check"
          size="default"
          @click="toggleSortMode"
          title="完成排序"
        />
      </div>

      <div>
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
</template>
<script setup>
import { ref, computed } from 'vue'
import { Sort, Check, Close } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import DraggableSelector from './DraggableSelector.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  mappointList: {
    type: Array,
    default: () => []
  },
  width: {
    type: String,
    default: '200px'
  },
  placeholder: {
    type: String,
    default: '请选择地点'
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:mappointList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const mappointOptions = computed(() => {
  if (props.mappointList && Array.isArray(props.mappointList)) {
    props.mappointList.forEach(mappoint => {
      let label = `${checkShowText(mappoint)}${mappoint.title}`
      mappoint.label = label
    })
    return props.mappointList
  }
  return []
})
const selectedMappoints = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 获取已选择地点的完整信息，用于排序组件
const selectedMappointOptions = computed(() => {
  return props.modelValue.map(mappointId => {
    const mappoint = props.mappointList.find(item => item._id === mappointId)
    return mappoint || { _id: mappointId, title: mappointId }
  })
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
// 获取地点列表
const getMappointList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  lastKeyword.value = keyword
  authApi
    .getMappointList(
      { keyword, status: statusFilter.value, size: 50, page: 1 },
      true
    )
    .then(res => {
      emit('update:mappointList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索地点
let queryMappointsTimer = null
const queryMappoints = query => {
  if (queryMappointsTimer) {
    clearTimeout(queryMappointsTimer)
  }
  queryMappointsTimer = setTimeout(() => {
    getMappointList(query)
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

const mappointSelectorRef = ref(null)
const getSelectedList = () => {
  return mappointSelectorRef.value?.showTagList || []
}

// 暴露方法
defineExpose({
  getSelectedList
})
</script>

<style scoped>
.mappoint-selector-container {
  display: inline-block;
}

.mappoint-selector-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.mappoint-sort-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
