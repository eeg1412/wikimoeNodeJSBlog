<template>
  <ClientOnly>
    <Teleport :to="`#caption-${componentId}`" v-if="showUI && description">
      <div
        class="bg-primary bg-opacity-50 rounded px-2 py-1 text-white text-sm"
      >
        {{ description }}
      </div>
    </Teleport>
  </ClientOnly>
</template>
<script setup>
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { getAttachmentListApi } from '@/api/attachment'
const emits = defineEmits()
const props = defineProps({
  albumId: {
    type: String,
    default() {
      return ''
    },
  },
  // 是否显示
  show: {
    type: Boolean,
    default: false,
  },
})

const toast = useToast()
const showUI = ref(false)

const componentId = generateRandomString(8)

const attachmentList = ref([])
const getList = async () => {
  const res = await getAttachmentListApi({
    album: props.albumId,
  }).catch((err) => {
    console.log(err)
    return null
  })
  if (!res) {
    return
  } else if (res.data.length <= 0) {
    toast.add({
      title: '暂无图片',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
    return
  }
  attachmentList.value = res.data
}

watch(
  () => props.show,
  (newVal, oldVal) => {
    if (newVal) {
      open()
    }
  }
)

const open = async () => {
  attachmentList.value = []
  itemIndex.value = 0
  await getList()
  if (attachmentList.value.length <= 0) {
    emits('update:show', false)
    return
  }
  lightbox.addFilter('numItems', (numItems) => {
    return attachmentList.value.length
  })
  lightbox.addFilter('itemData', (itemData, index) => {
    const mimetype = attachmentList.value[index].mimetype
    const width = attachmentList.value[index].width
    const height = attachmentList.value[index].height
    const src = attachmentList.value[index].filepath
    if (mimetype.indexOf('video') > -1) {
      return {
        html: `<div class="previewer-video-body">
                  <video 
                    id="lightbox-video-${index}"
                    controls="controls"
                    playsinline="true"
                    preload="auto"
                    muted="muted"
                    autoplay="autoplay"
                    loop="loop"
                    width="${width}"
                    height="${height}">
                    <source
                      src="${src}"
                      type="video/mp4"
                    />
                    </video>
                  </div>`,
      }
    }
    return {
      src: attachmentList.value[index].filepath,
      width: attachmentList.value[index].width,
      height: attachmentList.value[index].height,
    }
  })
  lightbox.loadAndOpen(0)
  if (window.location.hash !== '#albumlightboxopen') {
    window.history.pushState(null, '', '#albumlightboxopen')
  }
}

const itemIndex = ref(0)
const description = computed(() => {
  return attachmentList.value[itemIndex.value]?.description
})

let lightbox = null
let videoTimer = null
const initLightbox = async () => {
  const lightboxopen = window.location.hash === '#albumlightboxopen'
  if (lightboxopen) {
    window.location.hash = ''
  }
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    preload: [1, 2],
  })
  lightbox.init()
  lightbox.on('close', () => {
    console.log('close')
    if (window.location.hash === '#albumlightboxopen') {
      window.history.back()
    }
    showUI.value = false
    emits('update:show', false)
  })
  lightbox.on('change', () => {
    console.log('change')
    const currIndex = lightbox.pswp.currIndex
    itemIndex.value = currIndex
    if (videoTimer) {
      clearTimeout(videoTimer)
    }
    videoTimer = setTimeout(() => {
      const videoList = document.querySelectorAll('.previewer-video-body video')
      videoList.forEach((video) => {
        video.pause()
      })
      // 当前video播放
      const video = document.querySelector(`#lightbox-video-${currIndex}`)
      video && video.play()
    }, 100)
  })
  lightbox.on('initialLayout', () => {
    console.log('initialLayout')
    // photoswipe measures size of various elements
    // if you need to read getBoundingClientRect of something - do it here
    showUI.value = true
  })
  // 注册UI
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: `<div id="caption-${componentId}"></div>`,
      onInit: (el, pswp) => {
        console.log(el)
      },
    })
  })
}
const onHashchange = () => {
  if (window.location.hash !== '#albumlightboxopen' && props.show) {
    console.log('close hashchange')
    lightbox && lightbox.pswp && lightbox.pswp.close()
  }
}
onMounted(() => {
  initLightbox()
  window.addEventListener('hashchange', onHashchange)
})
onUnmounted(() => {
  lightbox.destroy()
  lightbox = null
  window.removeEventListener('hashchange', onHashchange)
})
</script>
<style></style>
