<template>
  <div class="mt-2">
    <div
      v-if="rating"
      class="text-sm mb-1 text-primary border border-solid border-primary-400 text-center rounded"
    >
      <span>{{ rating }}</span
      >分 | {{ ratingToText(rating) }}
    </div>
    <div
      v-else
      class="text-sm mb-1 text-primary border border-solid border-primary-400 text-center rounded"
    >
      暂无评分
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
})
</script>
<style scoped></style>
