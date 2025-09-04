<template>
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
    :style="{ width: width }"
    :placeholder="placeholder"
    ref="mappointSelectorRef"
  >
    <el-option
      v-for="item in mappointOptions"
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
  }
})

const emit = defineEmits(['update:modelValue', 'update:mappointList'])

// 本地状态
const loading = ref(false)
const mappointOptions = computed(() => props.mappointList)
const selectedMappoints = computed({
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

// 获取地点列表
const getMappointList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getMappointList({ keyword, status: 1, size: 50, page: 1 }, true)
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
  }, 50)
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
