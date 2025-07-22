<template>
  <div v-if="tweetList.length > 0" class="mt-3" @click.stop>
    <div
      v-if="showTitle"
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      相关推文：
    </div>
    <div
      class="content-grid-list-2-1"
      :class="{
        'is-odd': tweetList.length % 2 !== 0
      }"
    >
      <div
        class="header-scroll-margin-top content-grid-list-2-1-item"
        v-for="item in tweetList"
        :id="`post-${idPrefix}-${item._id}-${postId}`"
        :key="item._id"
      >
        <NuxtLink
          :to="{
            name: 'postDetail',
            params: { id: item.alias || item._id }
          }"
          target="_blank"
        >
          <LazyTweetContentLite :item="item" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  tweetList: {
    type: Array,
    default() {
      return []
    }
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  idPrefix: {
    type: String,
    default: ''
  },
  postId: {
    type: String,
    default: ''
  }
})
</script>
<style scoped></style>
