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
    <template #header>
      <el-radio-group
        v-model="statusFilter"
        @change="queryPosts(lastKeyword)"
        :disabled="loading"
      >
        <el-radio :label="undefined" size="small">全部</el-radio>
        <el-radio :label="0" size="small">仅草稿</el-radio>
        <el-radio :label="1" size="small">仅发布</el-radio>
      </el-radio-group>
    </template>
    <el-option
      v-for="item in postOptions"
      :key="item._id"
      :label="`${checkShowText(item)}${
        item.date ? $formatDate(item.date, '【YYYY年MM月DD日】') : ''
      }${type === 2 ? $limitStr(item.excerpt, 50) : item.title}`"
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
    default: () => []
  },
  postList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择博文'
  },
  currentPostId: {
    type: String,
    default: ''
  },
  type: {
    type: [String, Number],
    default: 1
  }
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
const statusFilter = ref(undefined) // 0:草稿,1:发布

// 获取博文列表
const getPostList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  lastKeyword.value = keyword
  authApi
    .getPostList(
      {
        keyword,
        status: statusFilter.value,
        type: props.type,
        size: 50,
        page: 1
      },
      true
    )
    .then(res => {
      emit('update:postList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索博文
let queryPostsTimer = null
const queryPosts = query => {
  if (queryPostsTimer) {
    clearTimeout(queryPostsTimer)
  }
  queryPostsTimer = setTimeout(() => {
    getPostList(query)
  }, 100)
}
</script>
