<template>
  <Adsbygoogle
    :ad-slot="adSlot"
    :ad-format="adFormat"
    :ad-layout-key="adLayoutKey"
  />
</template>
<script setup>
const props = defineProps({
  ad: {
    type: String,
    required: true,
  },
})
// ad 转换
const adArray = props.ad.split(',')
const adSlot = adArray[0]
const adFormat = adArray[1]
const adLayoutKey = adArray[2]
</script>
