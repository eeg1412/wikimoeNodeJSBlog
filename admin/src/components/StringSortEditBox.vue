<template>
  <div class="string-sort-edit-box-container">
    <draggable
      v-model="innerList"
      item-key="id"
      ghost-class="string-sort-edit-box-ghost"
      animation="300"
      class="string-sort-edit-box-list"
      v-if="innerList.length > 0"
    >
      <template #item="{ element }">
        <div class="string-sort-edit-box-item">
          <div class="string-sort-edit-box-content">
            {{ getDisplayText(element.text) }}
          </div>
        </div>
      </template>
    </draggable>
    <div v-else class="string-sort-edit-box-empty">暂无数据</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  map: {
    type: Object,
    default: () => ({})
  },
  maxWidth: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:modelValue'])

// 计算属性，处理内部数据结构与外部字符串数组的转换
const innerList = computed({
  get: () => {
    return props.modelValue.map((text, index) => ({
      id: index.toString(),
      text
    }))
  },
  set: val => {
    emit(
      'update:modelValue',
      val.map(item => item.text)
    )
  }
})

// 根据 map 获取显示文本
const getDisplayText = text => {
  return props.map && props.map[text] !== undefined ? props.map[text] : text
}
</script>

<style scoped>
.string-sort-edit-box-container {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  padding: 10px;
  width: 100%;
  max-width: v-bind(maxWidth);
  background-color: var(--el-bg-color);
}

.string-sort-edit-box-list {
  min-height: 40px;
}

.string-sort-edit-box-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
  transition: background-color 0.2s;
  cursor: move;
}

.string-sort-edit-box-item:hover {
  background-color: var(--el-fill-color-light);
}

.string-sort-edit-box-content {
  flex: 1;
  line-height: 1.5;
  word-break: break-all;
  color: var(--el-text-color-primary);
}

.string-sort-edit-box-ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
  border: 1px dashed var(--el-color-primary);
}

.string-sort-edit-box-empty {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 15px 0;
  font-size: 14px;
}
</style>
