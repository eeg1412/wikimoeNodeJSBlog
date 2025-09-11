<template>
  <div class="post-selector-container" style="width: 100%">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="post-selector-wrapper">
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
        ref="postSelectRef"
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
          :label="item.label"
          :value="item._id"
          :disabled="item._id === currentPostId"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedPosts.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="post-sort-wrapper">
      <DraggableSelector
        v-model="selectedPosts"
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
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:postList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const postSelectRef = ref(null)
const getSelectedList = () => {
  return postSelectRef.value?.showTagList || []
}
const postOptions = computed(() => {
  if (props.postList && Array.isArray(props.postList)) {
    props.postList.forEach(post => {
      const label = `${checkShowText(post)}${
        post.date ? formatDate(post.date, '【YYYY年MM月DD日】') : ''
      }${props.type === 2 ? limitStr(post.excerpt, 50) : post.title}`
      post.label = label
    })
    return props.postList
  } else {
    return []
  }
})
const selectedPosts = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 获取已选择博文的完整信息，用于排序组件
const selectedPostOptions = computed(() => {
  return props.modelValue.map(postId => {
    const post = props.postList.find(item => item._id === postId)
    return post || { _id: postId, title: postId }
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
.post-selector-container {
  display: inline-block;
}

.post-selector-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.post-sort-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
