<template>
  <el-select
    v-model="selectedMovies"
    multiple
    filterable
    remote
    :remote-method="queryMovies"
    :automatic-dropdown="true"
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    :placeholder="placeholder"
    style="width: 100%"
  >
    <el-option
      v-for="item in movieOptions"
      :key="item._id"
      :label="`${checkShowText(item)}${setMovieTitle(item)}`"
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
  movieList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择电影'
  }
})

const emit = defineEmits(['update:modelValue', 'update:movieList'])

// 本地状态
const loading = ref(false)
const movieOptions = computed(() => props.movieList)
const selectedMovies = computed({
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

// 设置电影标题显示格式
const setMovieTitle = item => {
  const year = item.year
  const month = item.month
  const day = item.day
  if (year && month && day) {
    return `【${year}年${month}月${day}日观看】${item.title}`
  }
  return item.title
}

// 获取电影列表
const getMovieList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  authApi
    .getMovieList({ keyword, status: 1, size: 50, page: 1 }, true)
    .then(res => {
      emit('update:movieList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索电影
let queryMoviesTimer = null
const queryMovies = query => {
  if (queryMoviesTimer) {
    clearTimeout(queryMoviesTimer)
  }
  queryMoviesTimer = setTimeout(() => {
    getMovieList(query)
  }, 50)
}
</script>
