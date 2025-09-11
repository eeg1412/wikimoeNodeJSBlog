<template>
  <div class="vote-selector-container" style="width: 100%">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="content-selector-wrapper">
      <el-select
        v-model="selectedVotes"
        multiple
        filterable
        remote
        :remote-method="queryVotes"
        :automatic-dropdown="true"
        default-first-option
        :reserve-keyword="false"
        :loading="loading"
        :placeholder="placeholder"
        style="width: 100%"
        ref="voteSelectRef"
      >
        <template #header>
          <el-radio-group
            v-model="statusFilter"
            @change="queryVotes(lastKeyword)"
            :disabled="loading"
          >
            <el-radio :label="undefined" size="small">全部</el-radio>
            <el-radio :label="0" size="small">仅不显示</el-radio>
            <el-radio :label="1" size="small">仅显示</el-radio>
          </el-radio-group>
        </template>
        <el-option
          v-for="item in voteOptions"
          :key="item._id"
          :label="item.label"
          :value="item._id"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedVotes.length <= 1"
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
        v-model="selectedVotes"
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
import DraggableSelector from './DraggableSelector.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  voteList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择投票'
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:voteList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const voteSelectRef = ref(null)
const getSelectedList = () => {
  return voteSelectRef.value?.showTagList || []
}
const voteOptions = computed(() => {
  if (props.voteList && Array.isArray(props.voteList)) {
    props.voteList.forEach(vote => {
      let label = `${checkShowText(vote)}${vote.title}`
      vote.label = label
    })
    return props.voteList
  }
  return []
})
const selectedVotes = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const lastKeyword = ref(null)
const statusFilter = ref(undefined) // 0:不显示,1:显示
// 获取投票列表
const getVoteList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  lastKeyword.value = keyword
  authApi
    .getVoteList(
      { keyword, status: statusFilter.value, size: 50, page: 1 },
      true
    )
    .then(res => {
      emit('update:voteList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索投票
let queryVotesTimer = null
const queryVotes = query => {
  if (queryVotesTimer) {
    clearTimeout(queryVotesTimer)
  }
  queryVotesTimer = setTimeout(() => {
    getVoteList(query)
  }, 100)
}

// 检查显示文本
const checkShowText = item => {
  if (item.status === 0) {
    return '【状态:不显示】'
  }
  return ''
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
.vote-selector-container {
  display: inline-block;
}
</style>
