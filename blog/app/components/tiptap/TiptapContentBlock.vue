<template>
  <div
    class="rounded-lg border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 my-2"
  >
    <DivLoading :loading="isLoading" />
    <template v-if="isLoading">
      <div class="text-sm text-gray-500">{{ blockTitle || '加载中...' }}</div>
    </template>
    <template v-else-if="errorMsg">
      <div class="text-sm text-red-500">{{ errorMsg }}</div>
    </template>
    <template v-else>
      <!-- ACGN Items -->
      <template v-if="isAcgnType">
        <LazyBangumiItem
          v-if="blockType === 'bangumi' && itemData"
          :bangumi="itemData"
          :enableSummaryToggle="true"
          :summaryToggleThreshold="80"
        />
        <LazyMovieItem
          v-if="blockType === 'movie' && itemData"
          :movie="itemData"
          :enableSummaryToggle="true"
          :summaryToggleThreshold="80"
        />
        <LazyBookItem
          v-if="blockType === 'book' && itemData"
          :book="itemData"
          :enableSummaryToggle="true"
          :summaryToggleThreshold="80"
        />
        <LazyGameItem
          v-if="blockType === 'game' && itemData"
          :game="itemData"
          :enableSummaryToggle="true"
          :summaryToggleThreshold="80"
        />
      </template>
      <!-- Vote (display only) -->
      <template v-if="blockType === 'vote' && itemData">
        <h4 class="text-base font-bold mb-1">{{ itemData.title }}</h4>
        <div class="text-xs text-gray-500 mb-2" v-if="itemData.endTime">
          截止时间:
          <ClientOnly
            >{{ formatDate(itemData.endTime)
            }}<template #fallback>加载中...</template></ClientOnly
          >
        </div>
        <div class="text-xs text-gray-500 mb-2">
          <span v-if="itemData.votes || itemData.votes === 0"
            >共 {{ itemData.votes }} 票<span class="tenten"></span
          ></span>
          <span>最多可选择 {{ itemData.maxSelect }} 项</span>
        </div>
        <div
          class="mb-2 text-sm rounded-md border border-solid border-gray-200 dark:border-gray-600 px-2 py-1 flex justify-between items-center"
          v-for="option in itemData.options"
          :key="option._id"
        >
          <span>{{ option.title }}</span>
          <span
            class="text-xs text-gray-400 pl-2 whitespace-nowrap"
            v-if="option.votes || option.votes === 0"
          >
            {{ option.votes }} 票 ({{
              option.votes && itemData.votes
                ? ((option.votes / itemData.votes) * 100).toFixed(0)
                : '0'
            }}%)
          </span>
          <span
            class="text-xs text-gray-400 pl-2 whitespace-nowrap"
            v-else-if="itemData.showResultAfter"
            >投票后显示票数</span
          >
        </div>
      </template>
    </template>
  </div>
</template>
<script setup>
import { getBangumiDetailApiFetch } from '@/api/bangumi'
import { getMovieDetailApiFetch } from '@/api/movie'
import { getBookDetailApiFetch } from '@/api/book'
import { getGameDetailApiFetch } from '@/api/game'
import { getVoteDetailApi } from '@/api/vote'

const props = defineProps({
  blockType: {
    type: String,
    required: true
  },
  blockId: {
    type: String,
    required: true
  },
  blockTitle: {
    type: String,
    default: ''
  }
})

const isAcgnType = computed(() => {
  return ['bangumi', 'movie', 'book', 'game'].includes(props.blockType)
})

const isLoading = ref(true)
const errorMsg = ref('')
const itemData = ref(null)

const fetchApis = {
  bangumi: (id) => getBangumiDetailApiFetch({ id }),
  movie: (id) => getMovieDetailApiFetch({ id }),
  book: (id) => getBookDetailApiFetch({ id }),
  game: (id) => getGameDetailApiFetch({ id }),
  vote: (id) => getVoteDetailApi({ id })
}

const fetchData = async () => {
  const apiFn = fetchApis[props.blockType]
  if (!apiFn) {
    errorMsg.value = '未知的内容类型'
    isLoading.value = false
    return
  }
  try {
    const res = await apiFn(props.blockId)
    if (res?.data) {
      itemData.value = res.data
    } else {
      errorMsg.value = props.blockTitle || '内容加载失败'
    }
  } catch (err) {
    console.error(`Failed to fetch ${props.blockType} detail:`, err)
    errorMsg.value = props.blockTitle || '内容加载失败'
  } finally {
    isLoading.value = false
  }
}

const containerRef = ref(null)
let observer = null
let timer = null

onMounted(() => {
  nextTick(() => {
    timer = setTimeout(() => {
      if (containerRef.value) {
        observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchData()
            observer.disconnect()
            observer = null
          }
        })
        observer.observe(containerRef.value)
      } else {
        fetchData()
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
