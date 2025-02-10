<template>
  <el-select
    v-model="selectedTags"
    :placeholder="placeholder"
    clearable
    :style="{ width: width }"
    multiple
    filterable
    remote
    :automatic-dropdown="true"
    :remote-method="queryTags"
    :loading="tagsIsLoading"
    default-first-option
    :reserve-keyword="false"
    ref="tagSelectorRef"
  >
    <el-option
      v-for="item in tagList"
      :key="item._id"
      :label="item.tagname"
      :value="item._id"
    >
      <template v-if="item.isNew">
        {{ `创建新标签「${item.tagname}」` }}
      </template>
    </el-option>
  </el-select>
</template>

<script>
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { replaceSpacesWithUnderscores } from '@/utils/utils'

export default {
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择标签',
    },
    width: {
      type: String,
      default: '200px',
    },
    addNew: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const tagList = ref([])
    const tagsIsLoading = ref(false)
    let queryTagsTimer = null

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
        .then((res) => {
          const list = res.data.list
          if (tagKeyword && props.addNew) {
            // 如果tagkeyword没有在list里面，就把tagkeyword push到list里面
            const hasTagKeyword = list.some(
              (item) => item.tagname === formatTagKeyword
            )
            if (!hasTagKeyword) {
              list.push({
                _id: formatTagKeyword,
                tagname: formatTagKeyword,
                isNew: true,
              })
            }
          }
          tagList.value = list
        })
        .finally(() => {
          tagsIsLoading.value = false
        })
    }

    const queryTags = (query) => {
      if (queryTagsTimer) {
        clearTimeout(queryTagsTimer)
      }
      queryTagsTimer = setTimeout(() => {
        getTagList(query)
      }, 50)
    }

    const selectedTags = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const tagSelectorRef = ref(null)

    const getSelectedList = () => {
      return tagSelectorRef.value?.showTagList || []
    }

    return {
      getTagList,
      tagList,
      tagsIsLoading,
      queryTags,
      selectedTags,
      tagSelectorRef,
      getSelectedList,
    }
  },
}
</script>
