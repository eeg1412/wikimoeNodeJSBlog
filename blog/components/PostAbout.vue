<template>
  <div v-if="postList.length > 0" class="mt-4">
    <div
      class="mb-4 text-gray-600 font-bold text-base border-b border-dotted pb-3 border-gray-300"
    >
      相关博文：
    </div>
    <div>
      <div class="mb-4" v-for="item in postList" :key="item._id">
        <NuxtLink
          :to="{
            name: 'postDetail',
            params: { id: item.alias || item._id },
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
    },
  },
})
</script>
<style scoped></style>
