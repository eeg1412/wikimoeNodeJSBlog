<template>
  <Adsbygoogle
    :ad-slot="adSlot"
    :ad-format="adFormat"
    :ad-layout-key="adLayoutKey"
  />
</template>
<script setup>
const props = defineProps({
  // :ad-slot="GOOGLE_ADSENSE_HOME_BT_SLOT"
  // :ad-format="GOOGLE_ADSENSE_HOME_BT_FORMAT"
  // :ad-layout-key="GOOGLE_ADSENSE_HOME_BT_LAYOUT_KEY"
  adSlot: {
    type: String,
    required: true,
  },
  adFormat: {
    type: String,
  },
  adLayoutKey: {
    type: String,
  },
})
</script>
