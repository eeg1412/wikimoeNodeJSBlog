<template>
  <div class="rating-body">
    <div
      v-if="rating"
      class="text-sm text-primary border border-solid border-gray-200 dark:border-gray-600 text-center rounded flex items-center justify-center rating-item"
    >
      <span>{{ rating }}分</span><span class="rating-bar"></span
      ><span>{{ ratingToText(rating) }}</span>
    </div>
    <div
      v-else
      class="text-sm text-gray-300 dark:text-gray-500 border border-solid border-gray-200 dark:border-gray-600 text-center rounded flex items-center justify-center rating-item rating-item-no-rating"
    >
      <div class="rating-item-no-rating-inner">暂无评分</div>
    </div>
    <div class="rating-p-bar" v-if="rating && rating > 0">
      <div class="rating-p-bar-inner-parent">
        <div :style="{ width: percent }" class="rating-p-bar-inner"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0
  }
})

const percent = computed(() => {
  return props.rating > 0 ? props.rating.toFixed(1) + '%' : '0%'
})
</script>
<style scoped>
.rating-body {
  margin-top: 0px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}
.rating-item {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0;
  padding: 0.25rem;
  z-index: 2;
  position: relative;
}
.rating-item-no-rating {
  padding: 0.25rem;
}
.rating-item-no-rating-inner {
  @apply bg-gray-100/50 dark:bg-gray-700/40 rounded;
  width: 100%;
}
.rating-bar {
  @apply bg-primary-400;
  display: inline-block;
  width: 1px;
  height: 0.875rem;
  margin: 0 0.36rem;
}
.rating-p-bar {
  @apply p-1;
  height: calc(100% - 2px);
  position: absolute;
  z-index: 1;
  width: calc(100% - 2px);
  top: 1px;
  left: 1px;

  box-sizing: border-box;
}
.rating-p-bar-inner-parent {
  @apply border border-solid border-primary-200 dark:border-primary-600/60 rounded;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.rating-p-bar-inner {
  @apply bg-primary-400/20 rounded;
  height: 100%;
}
</style>
