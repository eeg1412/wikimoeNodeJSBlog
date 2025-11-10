<template>
  <div class="mt-3">
    <div
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      {{ options.sitePostRandomSimilarTitle }}：
    </div>
    <div
      class="random-post-list-body content-grid-list-2-1 mt-3"
      :class="{
        'is-odd': randomPostList.length % 2 !== 0
      }"
    >
      <!-- 遍历randomPostList -->
      <LazyPostAllTypeItem
        v-for="(item, index) in randomPostList"
        :key="index"
        :item="item"
      />
    </div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'

// props
const props = defineProps({
  randomPostList: {
    type: Array,
    default: () => []
  }
})

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
</script>
<style scoped></style>
