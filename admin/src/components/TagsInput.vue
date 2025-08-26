<template>
  <div class="tags-input-root">
    <div class="tags-input-tags">
      <el-tag
        v-for="(t, i) in tagsValue"
        :key="t + '-' + i"
        closable
        @close="removeTag(i)"
        class="tags-input-tag"
      >
        {{ t }}
      </el-tag>
      <div class="tags-input-input-wrap" v-if="tagsValue.length < maxTags">
        <el-input
          v-model="input"
          :placeholder="placeholder"
          class="tags-input-input"
          @keypress.enter.prevent="handleEnter"
          @blur="handleBlur"
          size="small"
          style="width: 160px"
        >
          <template #append>
            <el-button size="small" @click="addTag" class="tags-input-add-btn"
              >添加</el-button
            >
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // modelValue can be a single string (e.g. "a,b,c") or an array for backward compatibility
  modelValue: { type: [String, Array], default: '' },
  separator: { type: String, default: ',' },
  placeholder: { type: String, default: '请输入内容' },
  allowDuplicate: { type: Boolean, default: false },
  maxTags: { type: Number, default: Infinity }
})

const emit = defineEmits(['update:modelValue'])

const input = ref('')

const parseStringToTags = s => {
  if (s) {
    return s.split(props.separator)
  } else {
    return []
  }
}

const tagsValue = computed({
  get() {
    return parseStringToTags(props.modelValue)
  },
  set(v) {
    emit('update:modelValue', v.join(props.separator))
  }
})

function addTag() {
  const val = (input.value || '').trim()
  if (!val) return
  if (!props.allowDuplicate && tagsValue.value.includes(val)) {
    ElMessage.warning('标签已存在')
    return
  }
  tagsValue.value = [...tagsValue.value, val]
  input.value = ''
}

function removeTag(idx) {
  tagsValue.value = tagsValue.value.filter((_, i) => i !== idx)
}

function handleEnter() {
  addTag()
}

function handleBlur() {
  addTag()
}
</script>

<style scoped>
.tags-input-root {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tags-input-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tags-input-tag {
  /* rely mostly on Element Plus styles */
  display: inline-flex;
  align-items: center;
}
.tags-input-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tags-input-input {
  flex: 1 1 auto;
}
</style>
