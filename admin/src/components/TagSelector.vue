<template>
  <div class="tag-selector-container" :style="{ width: width }">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="tag-selector-wrapper">
      <el-select
        v-model="selectedTags"
        :placeholder="placeholder"
        clearable
        multiple
        filterable
        remote
        :automatic-dropdown="true"
        :remote-method="queryTags"
        :loading="tagsIsLoading"
        default-first-option
        :reserve-keyword="false"
        style="width: 100%"
        ref="tagSelectorRef"
      >
        <el-option
          v-for="item in tagOptions"
          :key="item._id"
          :label="item.tagname"
          :value="item._id"
        >
          <template v-if="item.isNew">
            {{ `创建新标签「${item.tagname}」` }}
          </template>
        </el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedTags.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="tag-sort-wrapper">
      <DraggableSelector
        v-model="selectedTags"
        :options="selectorTagList"
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

<script>
import { ref, computed } from 'vue'
import { Sort, Check, Close } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import { replaceSpacesWithUnderscores } from '@/utils/utils'
import DraggableSelector from './DraggableSelector.vue'

export default {
  components: {
    DraggableSelector,
    Sort,
    Check,
    Close
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    tagList: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '请选择标签'
    },
    width: {
      type: String,
      default: '200px'
    },
    addNew: {
      type: Boolean,
      default: false
    },
    sortable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:tagList'],
  setup(props, { emit }) {
    const tagsIsLoading = ref(false)
    const isSortMode = ref(false)
    const originalOrder = ref([])
    let queryTagsTimer = null

    // 使用 computed 来获取标签列表
    const tagOptions = computed(() => props.tagList)

    // 获取已选择标签的完整信息，用于排序组件
    const selectedTagOptions = computed(() => {
      return props.modelValue.map(tagId => {
        const tag = props.tagList.find(item => item._id === tagId)
        return tag || { _id: tagId, tagname: tagId }
      })
    })

    const getTagList = (tagKeyword = null, options = {}) => {
      if (tagsIsLoading.value) {
        return
      }
      const formatTagKeyword = replaceSpacesWithUnderscores(tagKeyword || '')
      tagsIsLoading.value = true
      authApi
        .getTagList(
          { keyword: formatTagKeyword, size: 100, page: 1, ...options },
          true
        )
        .then(res => {
          const list = res.data.list
          if (tagKeyword && props.addNew) {
            // 如果tagkeyword没有在list里面，就把tagkeyword push到list里面
            const hasTagKeyword = list.some(
              item => item.tagname === formatTagKeyword
            )
            if (!hasTagKeyword) {
              list.push({
                _id: formatTagKeyword,
                tagname: formatTagKeyword,
                isNew: true
              })
            }
          }
          emit('update:tagList', list)
        })
        .finally(() => {
          tagsIsLoading.value = false
        })
    }

    const queryTags = query => {
      if (queryTagsTimer) {
        clearTimeout(queryTagsTimer)
      }
      queryTagsTimer = setTimeout(() => {
        getTagList(query)
      }, 100)
    }

    const selectedTags = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value)
    })

    // 切换排序模式
    const selectorTagList = ref([])
    const toggleSortMode = () => {
      if (!isSortMode.value) {
        // 进入排序模式，保存原始顺序
        originalOrder.value = [...props.modelValue]
        selectorTagList.value = getSelectedList()
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

    const tagSelectorRef = ref(null)

    const getSelectedList = () => {
      return tagSelectorRef.value?.showTagList || []
    }

    return {
      getTagList,
      tagOptions,
      selectedTagOptions,
      tagsIsLoading,
      queryTags,
      selectedTags,
      tagSelectorRef,
      getSelectedList,
      isSortMode,
      toggleSortMode,
      cancelSort,
      handleSortChange,
      Sort,
      Check,
      Close,
      selectorTagList
    }
  }
}
</script>

<style scoped>
.tag-selector-container {
  display: inline-block;
}

.tag-selector-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.tag-sort-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
