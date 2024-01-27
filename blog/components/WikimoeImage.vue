<template>
  <img
    class="wikimoe-image"
    :class="{ 'pointer-zoom': dataHrefList }"
    @click="tryOpenHref"
    :src="srcCom"
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
import { storeToRefs } from 'pinia'
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

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
  clickStop: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: String,
    default: null,
  },
  mimetype: {
    type: String,
    default: null,
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

const tryOpenHref = (e) => {
  if (props.clickStop) {
    e.stopPropagation()
  }
  if (props.dataHref || props.dataHrefList) {
    const list = props.dataHrefList
    const dataSource = list.map((item) => {
      return {
        src: options.value.siteUrl + item.src,
        width: item.width,
        height: item.height,
        mimetype: item.mimetype,
      }
    })
    const index = props.dataHrefIndex || 0
    loadAndOpenImg(index, dataSource)
  }
}

const srcCom = computed(() => {
  if (props.updatedAt) {
    const time = new Date(props.updatedAt).getTime()
    return `${props.src}?t=${time}`
  }
  return props.src
})
</script>

<style scoped>
.wikimoe-image {
  width: 100%;
  height: auto;
  max-height: 100%;
}
</style>
