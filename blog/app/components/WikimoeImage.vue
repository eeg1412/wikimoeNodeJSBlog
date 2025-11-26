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

const { options } = useOptions()
const { pswpIsOpen } = usePswpIsOpen()

// props
const props = defineProps({
  // src
  src: {
    type: String,
    required: true
  },
  // alt
  alt: {
    type: String,
    required: true
  },
  // width
  width: {
    type: Number,
    required: false
  },
  // height
  height: {
    type: Number,
    required: false
  },
  // fit
  fit: {
    type: String
  },
  // lazy
  loading: {
    type: String
  },
  // 是否能点击打开
  dataHrefList: {
    type: Array,
    default: null
  },
  dataHrefIndex: {
    type: Number,
    default: 0
  },
  clickStop: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: String,
    default: null
  },
  mimetype: {
    type: String,
    default: null
  }
})

const router = useRouter()
const route = useRoute()

const componentNameLower = 'wikimoeimage'

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

const getImgList = () => {
  const list = props.dataHrefList
  const dataSource = list.map(item => {
    let width = item.width || null
    let height = item.height || null
    return {
      filepath: item.filepath,
      thumfor: item.thumfor,
      width: width,
      height: height,
      mimetype: item.mimetype,
      description: item.description,
      is360Panorama: item.is360Panorama ? true : false
    }
  })
  return dataSource
}

const tryOpenHref = async e => {
  if (props.clickStop) {
    e.stopPropagation()
  }
  if (props.dataHrefList) {
    const dataSource = getImgList()
    const index = props.dataHrefIndex || 0
    const { imgListHash } = getImgListHash(dataSource)
    openPhotoSwipe(
      dataSource,
      index,
      undefined,
      imgListHash,
      componentNameLower
    )
  }
}

const srcCom = computed(() => {
  if (props.updatedAt) {
    const time = new Date(props.updatedAt).getTime()
    return `${props.src}?t=${time}`
  }
  return props.src
})

const getImgListHash = (imgList = undefined) => {
  // console.time('getImgListHash')
  if (!imgList) {
    imgList = getImgList()
  }

  const imgListHash = getImgListHashFromImgList(imgList)

  console.log('imgListHash:', imgListHash)
  // console.timeEnd('getImgListHash')
  return {
    imgListHash,
    imgList
  }
}
const checkPswp = () => {
  const { pswpopen, pswphash, pswpcomponent, pswpindex = 0 } = route.query
  if (
    pswpopen === '1' &&
    pswpcomponent === componentNameLower &&
    props.dataHrefList &&
    pswpIsOpen.value === false
  ) {
    console.log('开始检查 pswpopen for WikimoeImage')
    const { imgListHash, imgList } = getImgListHash()
    if (pswphash === imgListHash && imgList.length > 0) {
      // 如果index不是数字，或者超出范围，则设置为0
      let index = Number(pswpindex)
      if (isNaN(index) || index < 0 || index >= imgList.length) {
        index = 0
      }
      console.log(
        'openPhotoSwipe from checkPswp:',
        imgList,
        index,
        imgListHash,
        componentNameLower
      )
      openPhotoSwipe(imgList, index, undefined, imgListHash, componentNameLower)
    }
  }
}
// watch route changes to check pswpopen
watch(
  () => route.query.pswpopen,
  (newVal, oldVal) => {
    // 如果是从非1变为1，则检查
    if (newVal === '1' && oldVal !== '1') {
      checkPswp()
    }
  }
)
onMounted(() => {
  nextTick(() => {
    checkPswp()
  })
})
</script>

<style scoped>
.wikimoe-image {
  width: 100%;
  height: auto;
  max-height: 100%;
}
</style>
