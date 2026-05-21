<template>
  <WUIButton
    size="2xs"
    color="primary"
    variant="soft"
    v-if="showBtn"
    :loading="isLoading"
    @click="isModalOpen = true"
    >{{ t('common.comment.retractButton', { seconds: countDown }) }}</WUIButton
  >
  <CommonDialog v-model:show="isModalOpen">
    <template #title>
      <div class="text-xl font-bold">
        {{ t('common.comment.retractTitle') }}
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div>{{ t('common.comment.retractConfirmText') }}</div>
        <div class="flex justify-end gap-3">
          <WUIButton color="gray" @click="isModalOpen = false">{{
            t('common.comment.cancel')
          }}</WUIButton>
          <WUIButton
            color="primary"
            :loading="isLoading"
            @click="retractComment"
            >{{ t('common.comment.confirmRetract') }}</WUIButton
          >
        </div>
      </div>
    </template>
  </CommonDialog>
</template>

<script setup>
import { deleteCommentRetractApi } from '@/api/comment'
const emits = defineEmits(['refresh'])
const { t } = useLang()
const { copyText } = useLocalizedText()
const props = defineProps({
  commentid: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
})
const { options } = useOptions()
const toast = useWToast()
const now = ref(Date.now())
const { setCommentRetractAuthDecode, commentRetractAuthDecode } =
  useCommentRetractAuthDecode()

const { setCommentRetractCountData, commentRetractCountData } =
  useCommentRetractCountData()
const min5 = 300000 // 5分钟

const showBtn = computed(() => {
  if (isSuccess.value) {
    return false
  }
  if (!commentRetractAuthDecode.value) {
    return false
  }
  if (options.value.siteCommentRetractLimit === 0) {
    return false
  }
  if (commentRetractCountData.value) {
    const count = commentRetractCountData.value.count || 0
    if (count >= options.value.siteCommentRetractLimit) {
      return false
    }
  }
  const exp = commentRetractAuthDecode.value.exp || 0
  const expDate = new Date(exp * 1000)
  if (expDate < now.value) {
    return false
  }
  const comment = currentComment.value
  if (!comment) {
    return false
  }
  // 对比date是否超过5分钟
  return now.value - new Date(comment.date || 0).getTime() < min5
})
// 倒计时数字
let timer = null
const countDown = computed(() => {
  if (!showBtn.value) {
    return 0
  }
  const comment = currentComment.value
  if (!comment) {
    return 0
  }
  const time = new Date(comment.date || 0).getTime() + min5 - now.value
  if (time <= 0) {
    return 0
  }
  return Math.floor(time / 1000)
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
      title: t('common.comment.retractExpired'),
      icon: 'i-heroicons-x-circle',
      color: 'red',
      timeout: 10000
    })
    isModalOpen.value = false
    return
  }
  isLoading.value = true
  deleteCommentRetractApi({
    id: props.commentid
  })
    .then(res => {
      console.log(res)
      toast.add({
        title: t('common.comment.retractSuccess'),
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 60000,
        actions: [
          {
            label: t('common.comment.copyContent'),
            click: () => copyText(props.content, toast)
          }
        ]
      })
      const commentRetractCountData = res.commentRetractCountData
      if (commentRetractCountData) {
        localStorage.setItem(
          'commentRetractCountData',
          JSON.stringify(commentRetractCountData)
        )
        setCommentRetractCountData(commentRetractCountData)
      }
      isModalOpen.value = false
      isSuccess.value = true
      clearInterval(timer)
      // 刷新评论列表
      emits('refresh')
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
            timeout: 10000
          })
        })
      }
      const code = err.response?._data?.code
      if (code === 401) {
        // 清空commentRetractJWT 并 重新 setCommentRetractAuthDecode
        localStorage.removeItem('commentRetractJWT')
        setCommentRetractAuthDecode()
      }
      const commentRetractCountData =
        err.response?._data?.commentRetractCountData
      if (commentRetractCountData) {
        localStorage.setItem(
          'commentRetractCountData',
          JSON.stringify(commentRetractCountData)
        )
        setCommentRetractCountData(commentRetractCountData)
      }
      isModalOpen.value = false
      nextTick(() => {
        isLoading.value = false
      })
    })
    .finally(() => {})
}

const currentComment = ref(null)
const findCurrentComment = () => {
  const commentList = commentRetractAuthDecode.value?.commentList || []
  currentComment.value = commentList.find(item => item.id === props.commentid)
}

// 只在 commentid 和 commentRetractAuthDecode 变化时更新 currentComment
watch(
  [() => props.commentid, commentRetractAuthDecode],
  () => {
    findCurrentComment()
  },
  { immediate: true }
)

onMounted(() => {
  if (showBtn.value) {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
  if (commentRetractCountData.value) {
    const todayEndTime = new Date(
      commentRetractCountData.value.todayEndTime || 0
    ).getTime()
    if (todayEndTime < now.value) {
      // 重新获取commentRetractCountData
      console.log('重新获取commentRetractCountData')
      setCommentRetractCountData()
    }
  }
  findCurrentComment()
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped></style>
