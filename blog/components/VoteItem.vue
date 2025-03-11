<template>
  <div
    class="rounded-lg border border-solid border-gray-300 dark:border-gray-600 p-4 mb-4 cursor-default bg-white dark:bg-gray-800"
    @click.stop
    ref="voteItemRef"
  >
    <!-- 标题 -->
    <h3 class="text-lg font-bold mb-2">{{ itemCom.title }}</h3>

    <!-- 截止时间 -->
    <div class="text-sm text-gray-500 mb-4" v-if="itemCom.endTime">
      截止时间: {{ formatDate(itemCom.endTime) }}
    </div>

    <!-- 最大选择提示 -->
    <div class="text-xs text-gray-500 mb-3">
      <span class="pr-3" v-if="itemCom.votes || itemCom.votes === 0"
        >共 {{ itemCom.votes }} 票</span
      ><span>(最多可选择 {{ itemCom.maxSelect }} 项)</span>
    </div>
    <!-- 选项列表 -->
    <div class="space-y-2 mb-4">
      <div
        v-for="option in itemCom.options"
        :key="option._id"
        class="flex items-center p-2 rounded-md border border-solid border-gray-300 dark:border-gray-600 hover:border-primary/80 dark:hover:border-primary/80 transition-colors"
      >
        <div class="flex-1">
          <label class="flex items-center cursor-pointer">
            <span>{{ option.title }}</span>
          </label>
        </div>
        <!-- 如果存在votes 显示投票数 -->
        <div
          class="text-sm text-gray-500"
          v-if="option.votes || option.votes === 0"
        >
          {{ option.votes }} 票
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <UButton block>提交</UButton>
  </div>
</template>

<script setup>
import { getVoteDetailApi } from '@/api/vote'
// props
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})
const voteItemRef = ref(null)
const itemRes = ref(null)
const getVoteDetail = async () => {
  const res = await getVoteDetailApi({
    id: props.item._id,
  })
  if (res) {
    itemRes.value = res.data
  }
}

const itemCom = computed(() => {
  return {
    ...props.item,
    ...itemRes.value,
  }
})

let observer = null
onMounted(() => {
  nextTick(() => {
    if (voteItemRef.value) {
      // 如果元素不在视口内，创建 IntersectionObserver
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          getVoteDetail()
          observer.disconnect()
          observer = null
        }
      })
      observer.observe(voteItemRef.value)
    }
  })
})
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped></style>
