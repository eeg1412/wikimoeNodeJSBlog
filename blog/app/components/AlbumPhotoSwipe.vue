<template></template>
<script setup>
import { getAttachmentListApiFetch } from '@/api/attachment'
const props = defineProps({
  albumId: {
    type: String,
    default() {
      return ''
    }
  }
})

const toast = useWToast()

const activeAlbumId = ref('')
const attachmentList = ref([])

const getList = async () => {
  const res = await getAttachmentListApiFetch({
    album: activeAlbumId.value
  }).catch(err => {
    console.log(err)
    return null
  })
  if (!res) {
    return
  } else if (res.data.length <= 0) {
    toast.add({
      title: '暂无相关内容',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
    return
  }
  attachmentList.value = res.data
}

/**
 * 打开相册
 * @param {string} [id] - 相册ID，不传则使用 albumId prop
 */
const open = async id => {
  activeAlbumId.value = id || props.albumId
  attachmentList.value = []
  await getList()
  if (attachmentList.value.length <= 0) {
    return
  }
  openPhotoSwipe(attachmentList.value, 0, () => {
    attachmentList.value = []
  })
}

onUnmounted(() => {})

defineExpose({ open })
</script>
<style scoped>
.album-photo-swipe-btn {
  width: 50px;
  height: 60px;
  color: #ffffff;
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.album-photo-swipe-caption {
  max-width: 1280px;
}
</style>
