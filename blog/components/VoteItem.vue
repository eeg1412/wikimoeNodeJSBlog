<template>
  <div
    class="rounded-lg border border-solid border-gray-300 dark:border-gray-600 mb-4 cursor-default bg-white dark:bg-gray-800 vote-item-body header-scroll-margin-top"
    @click.stop
    ref="voteItemRef"
    :id="domId"
  >
    <!-- 标题 -->
    <h3 class="text-lg font-bold mb-1">{{ itemCom.title }}</h3>

    <!-- 截止时间 -->
    <div class="text-sm text-gray-500 mb-2" v-if="itemCom.endTime">
      截止时间: {{ formatDate(itemCom.endTime) }}
    </div>

    <!-- 最大选择提示 -->
    <div class="text-xs text-gray-500 mb-3">
      <span v-if="itemCom.votes || itemCom.votes === 0"
        >共 {{ itemCom.votes }} 票<span class="tenten"></span></span
      ><span>最多可选择 {{ itemCom.maxSelect }} 项</span>
    </div>
    <!-- 选项列表 -->
    <div>
      <div class="mb-3" v-for="option in itemCom.options" :key="option._id">
        <div
          class="flex justify-between items-center rounded-md border border-solid border-gray-300 dark:border-gray-600 hover:border-primary/80 dark:hover:border-primary/80 transition-colors cursor-pointer vote-item-option"
          :class="{
            disabled: btnDisabled,
            active: optionIdList.includes(option._id),
          }"
          @click="handleSelect(option)"
        >
          <div class="vote-item-option-title">
            <span>{{ option.title }}</span>
          </div>
          <!-- 如果存在votes 显示投票数 -->
          <div
            class="text-gray-500 dark:text-gray-400 pl-2 vote-item-option-votes"
          >
            <span v-if="isLoading">加载中...</span>
            <span v-else-if="option.votes || option.votes === 0"
              >{{ option.votes }} 票 ({{
                option.votes
                  ? ((option.votes / itemCom.votes) * 100).toFixed(0)
                  : '0'
              }}%)</span
            >
            <span v-else-if="itemCom.showResultAfter">投票后显示票数</span>
          </div>
          <div class="vote-item-option-bar">
            <div
              class="vote-item-option-bar-inner"
              :style="{
                width: option.votes
                  ? (option.votes / itemCom.votes) * 100 + '%'
                  : '0%',
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <UButton
      block
      :loading="isLoading || isVoting"
      :disabled="btnDisabled"
      @click="doVote"
      >{{ btnText }}</UButton
    >
  </div>
</template>

<script setup>
import { getVoteDetailApi, postVoteApi } from '@/api/vote'
// props
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  postId: {
    type: String,
    default: null,
  },
})
const toast = useToast()

const voteItemRef = ref(null)
const itemRes = ref(null)
const getVoteDetail = async () => {
  const res = await getVoteDetailApi({
    id: props.item._id,
  })
  if (res) {
    itemRes.value = res.data
    voted.value = res.voted
    isExpired.value = res.isExpired
    bothIP.value = res.bothIP
    bothUUID.value = res.bothUUID
    isLoading.value = false
    optionIdList.value = res.options
  }
}

const itemCom = computed(() => {
  return {
    ...props.item,
    ...itemRes.value,
  }
})

const voted = ref(false)
const isExpired = ref(false)
const bothIP = ref(false)
const bothUUID = ref(false)
const btnDisabled = computed(() => {
  return voted.value || isExpired.value || isLoading.value || isVoting.value
})
const btnText = computed(() => {
  if (isLoading.value) {
    return '加载中...'
  } else if (isVoting.value) {
    return '正在投票...'
  } else if (voted.value) {
    if (bothUUID.value) {
      return '已投票'
    } else {
      return '同IP地址已投票'
    }
  } else if (isExpired.value) {
    return '投票已结束'
  } else {
    return '提交'
  }
})

const isLoading = ref(true)

const optionIdList = ref([])
const handleSelect = (option) => {
  if (voted.value || isExpired.value || isLoading.value || isVoting.value)
    return
  const maxSelect = itemCom.value.maxSelect
  const index = optionIdList.value.indexOf(option._id)
  if (maxSelect === 1) {
    if (index > -1) {
      optionIdList.value = []
    } else {
      optionIdList.value = [option._id]
    }
  } else {
    if (index > -1) {
      optionIdList.value.splice(index, 1)
    } else {
      if (optionIdList.value.length < maxSelect) {
        optionIdList.value.push(option._id)
      } else {
        toast.add({
          title: '最多只能选择' + maxSelect + '项',
          icon: 'i-heroicons-x-circle',
          color: 'red',
        })
      }
    }
  }
}
const isVoting = ref(false)
const doVote = async () => {
  if (optionIdList.value.length < 1) {
    toast.add({
      title: '请选择选项',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
    return
  }
  if (isLoading.value || isVoting.value) return
  isVoting.value = true
  postVoteApi({
    voteId: itemCom.value._id,
    postId: props.postId,
    optionIdList: optionIdList.value,
  })
    .then((res) => {
      if (res) {
        toast.add({
          title: '投票成功',
          icon: 'i-heroicons-check-circle',
          color: 'green',
          timeout: 10000,
        })
        getVoteDetail()
        voted.value = true
      }
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
      isVoting.value = false
    })
}

const domId = computed(() => {
  if (props.postId) {
    return `vote-item-${itemCom.value._id}-${props.postId}`
  } else {
    return `vote-item-${itemCom.value._id}`
  }
})

let observer = null
let timer = null
onMounted(() => {
  nextTick(() => {
    timer = setTimeout(() => {
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
    }, 100)
  })
})
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.vote-item-body {
  padding: 0.68rem 1rem 1rem 1rem;
}
.vote-item-option {
  position: relative;
  z-index: 1;
  isolation: isolate;
  overflow: hidden;
  font-size: 0.875rem;
  padding: 0.4rem 0.5rem;
}
.vote-item-option.active {
  @apply border-primary-400 text-primary-500 dark:text-primary-400;
}
.vote-item-option.disabled {
  @apply cursor-default hover:border-gray-300 dark:hover:border-gray-600;
}
.vote-item-option.active.disabled {
  @apply hover:border-primary-400 dark:hover:border-primary-400;
}
.vote-item-option-votes {
  font-size: 0.75rem;
  white-space: nowrap;
  min-width: 6.2rem;
  text-align: right;
}
.vote-item-option.active .vote-item-option-votes {
  @apply text-primary-500 dark:text-primary-400;
}
.vote-item-option-votes {
  text-align: right;
}
/* .vote-item-option.active .vote-item-option-bar {
  opacity: 0.3;
} */
.vote-item-option-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transition: opacity 0.3s;
}
.vote-item-option-bar-inner {
  @apply bg-gray-400/20;
  width: 0%;
  height: 100%;
  border-radius: 0.1rem;
  transition: width 0.3s;
}
.vote-item-option.active .vote-item-option-bar-inner {
  @apply bg-primary-400/20;
}
.vote-item-option-title,
.vote-item-option-votes {
  position: relative;
  z-index: 1;
}
/* .vote-item-option.active .vote-item-option-bar-inner {
  @apply bg-primary-800;
} */
</style>
