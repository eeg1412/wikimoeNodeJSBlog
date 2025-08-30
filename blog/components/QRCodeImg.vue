<template>
  <img
    v-if="qrCodeDataUrl"
    :src="qrCodeDataUrl"
    :alt="alt || '二维码'"
    :class="className"
  />
</template>

<script setup>
const QRCode = await import('qrcode')

// 定义组件props
const props = defineProps({
  // 要生成二维码的文本内容
  text: {
    type: String,
    required: true
  },
  // 二维码尺寸
  size: {
    type: Number,
    default: 256
  },
  // 错误纠正级别 L/M/Q/H
  errorCorrectionLevel: {
    type: String,
    default: 'M',
    validator: value => ['L', 'M', 'Q', 'H'].includes(value)
  },
  // 边距
  margin: {
    type: Number,
    default: 2
  },
  // 前景色
  color: {
    type: Object,
    default: () => ({
      dark: '#000000',
      light: '#FFFFFF'
    })
  },
  // img标签的alt属性
  alt: {
    type: String,
    default: ''
  },
  // img标签的class
  className: {
    type: String,
    default: ''
  }
})

// 响应式数据
const qrCodeDataUrl = ref('')
const error = ref('')

// 生成二维码的方法
const generateQRCode = async () => {
  try {
    error.value = ''

    if (!props.text) {
      error.value = '二维码内容不能为空'
      return
    }

    const options = {
      errorCorrectionLevel: props.errorCorrectionLevel,
      type: 'image/png',
      margin: props.margin,
      color: props.color,
      width: props.size
    }

    const dataUrl = await QRCode.toDataURL(props.text, options)
    qrCodeDataUrl.value = dataUrl
  } catch (err) {
    console.error('生成二维码失败:', err)
    error.value = '生成二维码失败'
    qrCodeDataUrl.value = ''
  }
}

// 监听props变化重新生成二维码
watch(
  () => [
    props.text,
    props.size,
    props.errorCorrectionLevel,
    props.margin,
    props.color
  ],
  () => {
    generateQRCode()
  },
  { deep: true }
)

// 组件挂载时生成二维码
onMounted(() => {
  generateQRCode()
})

// 暴露生成方法供外部调用
defineExpose({
  generateQRCode,
  qrCodeDataUrl
})
</script>

<style scoped>
.qr-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f56565;
  font-size: 14px;
  border: 1px dashed #fed7d7;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  background-color: #fef5e7;
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 14px;
  border: 1px dashed #e2e8f0;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  background-color: #f7fafc;
}
</style>
