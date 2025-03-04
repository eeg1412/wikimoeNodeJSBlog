<template>
  <div class="rating-body">
    <div
      v-if="rating"
      class="text-sm text-primary border border-solid border-primary-400 text-center rounded flex items-center justify-center"
    >
      <span>{{ rating }}分</span><span class="rating-bar"></span
      ><span>{{ ratingToText(rating) }}</span>
    </div>
    <div
      v-else
      class="text-sm text-gray-300 border border-solid border-gray-300 text-center rounded flex items-center justify-center"
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
<style scoped>
.rating-body {
  margin-top: 9px;
}
.rating-bar {
  @apply bg-primary-400;
  display: inline-block;
  width: 1px;
  height: 0.875rem;
  margin: 0 0.36rem;
}
</style>
