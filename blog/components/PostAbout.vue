<template>
  <div v-if="postList.length > 0" class="mt-3" @click.stop>
    <div
      v-if="showTitle"
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      相关博文：
    </div>
    <div>
      <div
        class="mb-3 header-scroll-margin-top"
        v-for="item in postList"
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
          <PostItem :post="item" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  postList: {
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
