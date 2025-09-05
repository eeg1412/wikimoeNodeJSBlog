<template>
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
      :label="`${checkShowText(item)}${item.title}`"
      :value="item._id"
    ></el-option>
  </el-select>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authApi } from '@/api'

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
  }
})

const emit = defineEmits(['update:modelValue', 'update:voteList'])

// 本地状态
const loading = ref(false)
const voteOptions = computed(() => props.voteList)
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
</script>
