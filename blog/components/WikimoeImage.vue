<template>
  <img
    class="wikimoe-image"
    :src="src"
    :alt="alt"
    :width="scaledWidth"
    :height="scaledHeight"
    :style="{ objectFit: fit }"
  />
</template>

<script setup>
import { computed } from 'vue'

// props
const props = defineProps({
  // src
  src: {
    type: String,
    required: true,
  },
  // alt
  alt: {
    type: String,
    required: true,
  },
  // width
  width: {
    type: Number,
    required: false,
  },
  // height
  height: {
    type: Number,
    required: false,
  },
  // fit
  fit: {
    type: String,
  },
  // lazy
  loading: {
    type: String,
  },
})

// computed properties
const scaledWidth = computed(() => {
  // calculate the scaled width based on the parent's width
  return props.width ? `${props.width}px` : '100%'
})

const scaledHeight = computed(() => {
  // calculate the scaled height based on the parent's height
  return props.height ? `${props.height}px` : 'auto'
})
</script>

<style scoped>
.wikimoe-image {
  width: 100%;
  height: auto;
}
</style>
