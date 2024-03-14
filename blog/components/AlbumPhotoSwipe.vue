<template>
  <div></div>
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
  if (window.location.hash !== '#lightboxopen') {
    window.history.pushState(null, '', '#lightboxopen')
  }
}

let lightbox = null
let videoTimer = null
const initLightbox = async () => {
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    preload: [1, 2],
  })
  lightbox.init()
  lightbox.on('close', () => {
    console.log('close')
    if (window.location.hash === '#lightboxopen') {
      window.history.back()
    }
    emits('update:show', false)
  })
  lightbox.on('change', () => {
    console.log('change')
    const currIndex = lightbox.pswp.currIndex
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
}
const onHashchange = () => {
  if (window.location.hash !== '#lightboxopen' && props.show) {
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
<style lang=""></style>
