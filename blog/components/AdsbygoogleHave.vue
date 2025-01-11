<template>
  <Adsbygoogle
    :ad-slot="adSlot"
    :ad-format="adFormat"
    :ad-layout-key="adLayoutKey"
    :key="updateKey"
    v-if="options.googleAdEnabled"
  />
</template>
<script setup>
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const route = useRoute()
const props = defineProps({
  ad: {
    type: String,
    default: '',
  },
})
// ad 转换
const adArray = props.ad ? props.ad.split(',') : []
const adSlot = adArray[0]
const adFormat = adArray[1]
const adLayoutKey = adArray[2]

// 检测路由变化，变化时更新广告
const updateKey = ref(0)
let routeChangeTimer = null
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      clearTimeout(routeChangeTimer)
      routeChangeTimer = setTimeout(() => {
        updateKey.value++
      }, 200)
    }
  },
  { deep: true }
)
</script>
