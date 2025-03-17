<template>
  <el-select
    v-model="selectedPosts"
    multiple
    filterable
    remote
    :remote-method="queryPosts"
    :automatic-dropdown="true"
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    :placeholder="placeholder"
    style="width: 100%"
  >
    <el-option
      v-for="item in postOptions"
      :key="item._id"
      :label="`${checkShowText(item)}${
        item.date ? $formatDate(item.date, '【YYYY年MM月DD日】') : ''
      }${item.title}`"
      :value="item._id"
      :disabled="item._id === currentPostId"
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
  postList: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择博文',
  },
  currentPostId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'update:postList'])

// 本地状态
const loading = ref(false)
const postOptions = computed(() => props.postList)
const selectedPosts = computed({
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

// 获取博文列表
const getPostList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getPostList({ keyword, status: 1, type: 1, size: 50, page: 1 }, true)
    .then((res) => {
      emit('update:postList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索博文
let queryPostsTimer = null
const queryPosts = (query) => {
  if (queryPostsTimer) {
    clearTimeout(queryPostsTimer)
  }
  queryPostsTimer = setTimeout(() => {
    getPostList(query)
  }, 50)
}
</script>
