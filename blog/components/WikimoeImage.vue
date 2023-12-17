<template>
  <img
    class="wikimoe-image"
    :class="{ pointer: dataHrefList }"
    @click="tryOpenHref"
    :src="src"
    :alt="alt"
    :width="scaledWidth"
    :height="scaledHeight"
    :style="styleObject"
    :loading="loading"
  />
</template>

<script setup>
import { computed } from 'vue'
import { loadAndOpenImg } from '@/utils'
import { _0 } from '#tailwind-config/theme/backdropBlur'

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
  // 是否能点击打开
  dataHrefList: {
    type: Array,
    default: null,
  },
  dataHrefIndex: {
    type: Number,
    default: 0,
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

const styleObject = computed(() => {
  const obj = {}
  if (props.fit) {
    obj.objectFit = props.fit
  }
  return obj
})

const tryOpenHref = () => {
  if (props.dataHref || props.dataHrefList) {
    const list = props.dataHrefList
    const dataSource = list.map((item) => {
      return {
        src: item.src,
        width: item.width,
        height: item.height,
      }
    })
    const index = props.dataHrefIndex || 0
    loadAndOpenImg(index, dataSource)
  }
}
</script>

<style scoped>
.wikimoe-image {
  width: 100%;
  height: auto;
  max-height: 100%;
}
</style>
