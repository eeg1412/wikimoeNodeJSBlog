<template>
  <span>{{ rfc5646Tag }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  script: {
    type: String,
    default: ''
  }
})

const rfc5646Tag = computed(() => {
  let tag = ''
  if (props.language) {
    tag = props.language?.toLowerCase()
  }
  if (props.script) {
    tag +=
      '-' +
      props.script.charAt(0).toUpperCase() +
      props.script.slice(1).toLowerCase()
  }
  if (props.region) {
    tag += '-' + props.region.toUpperCase()
  }
  return tag
})
</script>
