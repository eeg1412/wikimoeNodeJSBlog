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
  return props.width ? `${props.width}` : ''
})

const scaledHeight = computed(() => {
  // calculate the scaled height based on the parent's height
  return props.height ? `${props.height}` : ''
})

const styleObject = computed(() => {
  const obj = {}
  if (props.fit) {
    obj.objectFit = props.fit
  }
  return obj
})

const tryOpenHref = async (e) => {
  if (props.clickStop) {
    e.stopPropagation()
  }
  if (props.dataHref || props.dataHrefList) {
    const list = props.dataHrefList
    const dataSource = await Promise.all(
      list.map(async (item) => {
        const src = options.value.siteUrl + item.src
        // 如果width和height有一个不存在就读取图片的宽高
        let width = item.width
        let height = item.height
        if (!width || !height) {
          const img = new Image()
          img.src = src
          await new Promise((resolve, reject) => {
            img.onload = () => {
              resolve()
            }
            // error 事件会在图片加载错误时触发。
            img.onerror = (err) => {
              console.error(err)
              reject(err)
            }
          })
          width = img.width
          height = img.height
        }
        return {
          src: src,
          width: width,
          height: height,
          mimetype: item.mimetype,
        }
      })
    )
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
