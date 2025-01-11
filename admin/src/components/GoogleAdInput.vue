<template>
  <div class="google-ad-input">
    <el-input
      :model-value="modelValue"
      @update:model-value="updateValue"
      placeholder="ad-slot,ad-format,ad-layout-key"
    >
      <template #append>
        <el-button @click="openDialog">转换</el-button>
      </template>
    </el-input>
    <div>※填写格式为：ad-slot,ad-format,ad-layout-key</div>
    <div>※点击转换按钮可以将谷歌提供的广告代码转换成相应格式</div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
    title="转换谷歌广告代码"
  >
    <el-input
      v-model="textareaValue"
      type="textarea"
      :rows="10"
      placeholder="请粘贴谷歌广告代码"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConvert">转换</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

// 定义 props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// 定义 emits
const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const textareaValue = ref('')

// 更新值的方法
const updateValue = (value) => {
  emit('update:modelValue', value)
}

const openDialog = () => {
  dialogVisible.value = true
  textareaValue.value = ''
}

const handleConvert = () => {
  const adCode = textareaValue.value

  // 提取参数
  const slotMatch = adCode.match(/data-ad-slot="([^"]*)"/)
  const formatMatch = adCode.match(/data-ad-format="([^"]*)"/)
  const layoutKeyMatch = adCode.match(/data-ad-layout-key="([^"]*)"/)

  // 获取值或空字符串
  const slot = slotMatch ? slotMatch[1] : ''
  const format = formatMatch ? formatMatch[1] : ''
  const layoutKey = layoutKeyMatch ? layoutKeyMatch[1] : ''

  // 使用emit更新值
  emit('update:modelValue', `${slot},${format},${layoutKey}`)

  // 清空并关闭
  textareaValue.value = ''
  dialogVisible.value = false
}
</script>
<style scoped>
.google-ad-input {
  width: 100%;
}
</style>
