<template>
  <div v-if="voteList.length > 0" class="mt-3">
    <div
      v-if="showTitle"
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      相关投票：
    </div>
    <div>
      <div
        class="mb-3 header-scroll-margin-top"
        :id="`vote-item-${idPrefix}-${item._id}-${postId}`"
        v-for="item in voteList"
        :key="item._id"
      >
        <VoteItem :postId="postId" :item="item" :idPrefix="idPrefix" />
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  voteList: {
    type: Array,
    default() {
      return []
    },
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  idPrefix: {
    type: String,
    default: '',
  },
  postId: {
    type: String,
    default: null,
  },
})
</script>
<style scoped></style>
