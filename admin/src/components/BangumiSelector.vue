<template>
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
  >
    <el-option
      v-for="item in bangumiOptions"
      :key="item._id"
      :label="`${checkShowText(item)}【${item.year}年${seasonToStr(
        item.season
      )}季新番】${item.title}`"
      :value="item._id"
    ></el-option>
  </el-select>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { seasonToStr } from '@/utils/utils'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  bangumiList: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择番剧',
  },
})

const emit = defineEmits(['update:modelValue', 'update:bangumiList'])

// 本地状态
const loading = ref(false)
const bangumiOptions = computed(() => props.bangumiList)
const selectedBangumis = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

// 检查显示文本
const checkShowText = (item) => {
  if (item.status === 0) {
    return '【状态:不显示】'
  }
  return ''
}

// 获取番剧列表
const getBangumiList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getBangumiList({ keyword, status: 1, size: 50, page: 1 }, true)
    .then((res) => {
      emit('update:bangumiList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索番剧
let queryBangumisTimer = null
const queryBangumis = (query) => {
  if (queryBangumisTimer) {
    clearTimeout(queryBangumisTimer)
  }
  queryBangumisTimer = setTimeout(() => {
    getBangumiList(query)
  }, 50)
}
</script>
