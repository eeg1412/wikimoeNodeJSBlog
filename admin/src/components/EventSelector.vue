<template>
  <el-select
    v-model="selectedEvents"
    multiple
    filterable
    remote
    :remote-method="queryEvents"
    :automatic-dropdown="true"
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    :placeholder="placeholder"
    style="width: 100%"
  >
    <el-option
      v-for="item in eventOptions"
      :key="item._id"
      :label="`${checkShowText(item)}【${$formatDate(
        item.startTime,
        'YYYY年MM月'
      )}】${item.title}`"
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
    default: () => [],
  },
  eventList: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择活动',
  },
})

const emit = defineEmits(['update:modelValue', 'update:eventList'])

// 本地状态
const loading = ref(false)
const eventOptions = computed(() => props.eventList)
const selectedEvents = computed({
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

// 获取活动列表
const getEventList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getEventList({ keyword, status: 1, size: 50, page: 1 }, true)
    .then((res) => {
      emit('update:eventList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索活动
let queryEventsTimer = null
const queryEvents = (query) => {
  if (queryEventsTimer) {
    clearTimeout(queryEventsTimer)
  }
  queryEventsTimer = setTimeout(() => {
    getEventList(query)
  }, 50)
}
</script>
