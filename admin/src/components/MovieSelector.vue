<template>
  <div class="movie-selector-container" style="width: 100%">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="movie-selector-wrapper">
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
        ref="movieSelectRef"
      >
        <template #header>
          <el-radio-group
            v-model="statusFilter"
            @change="queryMovies(lastKeyword)"
            :disabled="loading"
          >
            <el-radio :label="undefined" size="small">全部</el-radio>
            <el-radio :label="0" size="small">仅不显示</el-radio>
            <el-radio :label="1" size="small">仅显示</el-radio>
          </el-radio-group>
        </template>
        <el-option
          v-for="item in movieOptions"
          :key="item._id"
          :label="item.label"
          :value="item._id"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedMovies.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="movie-sort-wrapper">
      <DraggableSelector
        v-model="selectedMovies"
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
import { formatDate, limitStr } from '@/utils/utils'

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
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:movieList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const movieSelectRef = ref(null)
const getSelectedList = () => {
  return movieSelectRef.value?.showTagList || []
}
const movieOptions = computed(() => {
  if (props.movieList && Array.isArray(props.movieList)) {
    props.movieList.forEach(movie => {
      let label = `${checkShowText(movie)}${setMovieTitle(movie)}`
      movie.label = label
    })
    return props.movieList
  }
  return []
})
const selectedMovies = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 获取已选择电影的完整信息，用于排序组件
const selectedMovieOptions = computed(() => {
  return props.modelValue.map(movieId => {
    const movie = props.movieList.find(item => item._id === movieId)
    return movie || { _id: movieId, title: movieId }
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
  lastKeyword.value = keyword
  authApi
    .getMovieList(
      { keyword, status: statusFilter.value, size: 50, page: 1 },
      true
    )
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
</script>

<style scoped>
.movie-selector-container {
  display: inline-block;
}

.movie-selector-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.movie-sort-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
