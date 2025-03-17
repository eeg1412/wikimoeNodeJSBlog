<template>
  <el-select
    v-model="selectedBooks"
    multiple
    filterable
    remote
    :remote-method="queryBooks"
    :automatic-dropdown="true"
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    :placeholder="placeholder"
    style="width: 100%"
  >
    <el-option
      v-for="item in bookOptions"
      :key="item._id"
      :label="`${checkShowText(item)}${
        item.booktype?.name ? `【${item.booktype.name}】` : ''
      }${item.title}`"
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
  bookList: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择书籍',
  },
})

const emit = defineEmits(['update:modelValue', 'update:bookList'])

// 本地状态
const loading = ref(false)
const bookOptions = computed(() => props.bookList)
const selectedBooks = computed({
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

// 获取书籍列表
const getBookList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getBookList({ keyword, status: 1, size: 50, page: 1 }, true)
    .then((res) => {
      emit('update:bookList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索书籍
let queryBooksTimer = null
const queryBooks = (query) => {
  if (queryBooksTimer) {
    clearTimeout(queryBooksTimer)
  }
  queryBooksTimer = setTimeout(() => {
    getBookList(query)
  }, 50)
}
</script>
