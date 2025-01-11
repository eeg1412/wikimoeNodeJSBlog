<template>
  <ins
    class="adsbygoogle"
    style="display: block"
    :data-ad-slot="adSlot"
    :data-ad-format="adFormat"
    :data-ad-layout-key="adLayoutKey"
    :data-ad-client="adClient"
  />
</template>

<script setup>
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const props = defineProps({
  adSlot: {
    type: String,
    default: '',
  },
  adFormat: {
    type: String,
    default: '',
  },
  adLayoutKey: {
    type: String,
    default: '',
  },
})

const adClient = options.googleAdId

// 组件挂载后初始化广告
onMounted(() => {
  nextTick(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error('广告加载失败:', error)
    }
  })
})
</script>

<style scoped></style>
