<template>
  <div class="draggable-selector" :style="{ width: width }">
    <div class="draggable-selector-input" :class="{ 'is-disabled': disabled }">
      <draggable
        v-model="innerSelectedItems"
        item-key="id"
        ghost-class="draggable-tag-ghost"
        animation="200"
        class="draggable-tags-list"
      >
        <template #item="{ element }">
          <el-tag
            effect="dark"
            :key="element.id"
            class="draggable-tag"
            :closable="!disabled"
            :disable-transitions="true"
            @close="handleRemoveTag(element.id)"
          >
            {{ getDisplayText(element) }}
          </el-tag>
        </template>
      </draggable>
    </div>

    <div
      v-if="!hasSelection && placeholder"
      class="draggable-selector-placeholder"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import draggable from 'vuedraggable'

export default {
  name: 'DraggableSelector',
  components: {
    draggable
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '拖拽排序'
    },
    width: {
      type: String,
      default: 'auto'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    }
  },
  emits: ['update:modelValue', 'change', 'remove-tag'],
  setup(props, { emit }) {
    // 计算选中的项目，转换为内部格式用于拖拽
    const innerSelectedItems = computed({
      get: () => {
        return props.modelValue.map((value, index) => {
          const option = props.options.find(
            opt =>
              (typeof opt === 'object' ? opt[props.valueKey] : opt) === value
          )
          return {
            id: `${value}_${index}`,
            value: value,
            option: option
          }
        })
      },
      set: newItems => {
        const newValues = newItems.map(item => item.value)
        emit('update:modelValue', newValues)
        emit('change', newValues)
      }
    })

    // 计算是否有选择
    const hasSelection = computed(() => props.modelValue.length > 0)

    // 获取显示文本
    const getDisplayText = item => {
      if (!item.option) return item.value
      if (typeof item.option === 'string') return item.option
      return item.option[props.labelKey] || item.value
    }

    // 处理移除标签
    const handleRemoveTag = id => {
      const itemIndex = innerSelectedItems.value.findIndex(
        item => item.id === id
      )
      if (itemIndex > -1) {
        const newValues = [...props.modelValue]
        const removedValue = newValues.splice(itemIndex, 1)[0]
        emit('update:modelValue', newValues)
        emit('change', newValues)
        emit('remove-tag', removedValue)
      }
    }

    return {
      innerSelectedItems,
      hasSelection,
      getDisplayText,
      handleRemoveTag
    }
  }
}
</script>

<style scoped>
.draggable-selector {
  display: inline-block;
}

.draggable-selector-input {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  padding: 4px 12px;
  min-height: 32px;
  box-sizing: border-box;
}

.draggable-selector-input.is-disabled {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
  cursor: not-allowed;
}

.draggable-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
  margin-left: -8px;
}

.draggable-tag {
  cursor: move;
  user-select: none;
  max-width: 100%;

  display: flex;
  align-items: center;
}
.draggable-tag :deep(.el-tag__content) {
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.draggable-tag-ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
  border: 1px dashed var(--el-color-primary);
}

.draggable-selector-placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  padding: 8px;
  text-align: center;
}
</style>
