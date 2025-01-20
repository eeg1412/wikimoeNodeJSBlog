<template>
  <UButton
    size="2xs"
    color="primary"
    variant="soft"
    v-if="showBtn"
    :loading="isLoading"
    @click="isModalOpen = true"
    >撤回(剩余{{ countDown }}秒)</UButton
  >
  <CommonDialog v-model:show="isModalOpen">
    <template #title>
      <div class="text-xl font-bold">确认撤回评论</div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div>确定要撤回这条评论吗？</div>
        <div class="flex justify-end gap-3">
          <UButton color="gray" @click="isModalOpen = false">取消</UButton>
          <UButton color="primary" :loading="isLoading" @click="retractComment"
            >确认撤回</UButton
          >
        </div>
      </div>
    </template>
  </CommonDialog>
</template>

<script setup>
import { useCommentRetractAuthDecodeStore } from '@/store/commentRetractAuthDecode'
import { deleteCommentRetractApi } from '@/api/comment'
const emits = defineEmits(['refresh'])
const props = defineProps({
  commentid: {
    type: String,
    default: '',
  },
})
const toast = useToast()
const now = ref(Date.now())
const commentRetractAuthDecodeStore = useCommentRetractAuthDecodeStore()
const { setCommentRetractAuthDecode } = commentRetractAuthDecodeStore
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
const isModalOpen = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const retractComment = () => {
  if (isLoading.value || !isModalOpen.value) {
    return
  }
  if (!showBtn.value) {
    toast.add({
      title: '已超过撤回时间，无法撤回评论',
      icon: 'i-heroicons-x-circle',
      color: 'red',
      timeout: 10000,
    })
    isModalOpen.value = false
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
      isModalOpen.value = false
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
      const code = err.response?._data?.code
      if (code === 401) {
        // 清空commentRetractJWT 并 重新 setCommentRetractAuthDecode
        localStorage.removeItem('commentRetractJWT')
        setCommentRetractAuthDecode()
      }
      isLoading.value = false
    })
    .finally(() => {})
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
