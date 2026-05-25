<template>
  <div class="device-info-display">
    <template v-if="hasDeviceInfo">
      <div v-if="deviceInfo.os?.name">系统：{{ deviceInfo.os.name }}</div>
      <div v-if="deviceInfo.os?.version">
        系统版本号：{{ deviceInfo.os.version }}
      </div>
      <div v-if="deviceInfo.browser?.name">
        浏览器：{{ deviceInfo.browser.name }}
      </div>
      <div v-if="deviceInfo.browser?.version">
        浏览器版本号：{{ deviceInfo.browser.version }}
      </div>
      <div v-if="deviceInfo.ua" class="word-break">UA：{{ deviceInfo.ua }}</div>
    </template>
    <span v-else class="cGray94">-</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  deviceInfo: {
    type: Object,
    default: null
  }
})

const hasDeviceInfo = computed(() => {
  if (!props.deviceInfo) {
    return false
  }

  return Object.keys(props.deviceInfo).length > 0
})
</script>
