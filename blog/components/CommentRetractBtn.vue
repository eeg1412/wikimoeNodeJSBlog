<template>
  <UButton
    size="2xs"
    color="primary"
    variant="soft"
    v-if="showBtn"
    :loading="isLoading"
    @click="retractComment"
    >撤回(剩余{{ countDown }}秒)</UButton
  >
</template>

<script setup>
import { useCommentRetractAuthDecodeStore } from '@/store/commentRetractAuthDecode'
import { deleteCommentRetractApi } from '@/api/comment'
const emits = defineEmits()
const props = defineProps({
  commentid: {
    type: String,
    default: '',
  },
})
const toast = useToast()
const now = ref(Date.now())
const commentRetractAuthDecodeStore = useCommentRetractAuthDecodeStore()
const { commentRetractAuthDecode } = storeToRefs(commentRetractAuthDecodeStore)

const showBtn = computed(() => {
  if (isSuccess.value) {
    return false
  }
  if (!commentRetractAuthDecode.value) {
    return false
  }
  const exp = commentRetractAuthDecode.value.exp || 0
  const expDate = new Date(exp * 1000)
  if (expDate < now.value) {
    return false
  }
  const commentList = commentRetractAuthDecode.value.commentList || []
  const comment = commentList.find((item) => item.id === props.commentid)
  if (!comment) {
    return false
  }
  // 对比date是否超过5分钟
  return now.value - new Date(comment.date || 0).getTime() < 5 * 60 * 1000
})
// 倒计时数字
let timer = null
const countDown = computed(() => {
  if (!showBtn.value) {
    return 0
  }
  const commentList = commentRetractAuthDecode.value.commentList || []
  const comment = commentList.find((item) => item.id === props.commentid)
  if (!comment) {
    return 0
  }
  const time = new Date(comment.date || 0).getTime() + 5 * 60 * 1000 - now.value
  if (time <= 0) {
    return 0
  }
  return Math.ceil(time / 1000)
})

const isLoading = ref(false)
const isSuccess = ref(false)
const retractComment = () => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  deleteCommentRetractApi({
    id: props.commentid,
  })
    .then((res) => {
      console.log(res)
      toast.add({
        title: '已成功撤回评论',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000,
      })
      isSuccess.value = true
      // 刷新评论列表
      emits('refresh')
    })
    .catch((err) => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach((item) => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
            timeout: 10000,
          })
        })
      }
    })
    .finally(() => {
      isLoading.value = false
    })
}
onMounted(() => {
  if (showBtn.value) {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped></style>
