<template>
  <div class="rating-body">
    <div
      v-if="rating"
      class="text-sm text-primary text-center rounded flex items-center justify-center rating-item"
    >
      <span>{{ rating }}分</span><span class="rating-bar"></span
      ><span>{{ ratingToText(rating) }}</span>
    </div>
    <div
      v-else
      class="text-sm text-gray-300 dark:text-gray-500 text-center rounded flex items-center justify-center rating-item rating-item-no-rating"
    >
      <div class="rating-item-no-rating-inner flex items-center justify-center">
        暂无评分
      </div>
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
  @apply pt-2;
  z-index: 2;
  position: relative;
  height: 33px;
}
.rating-item-no-rating-inner {
  @apply bg-gray-100/50 dark:bg-gray-700/40 rounded;
  width: 100%;
  height: 100%;
}
.rating-bar {
  @apply bg-primary-400;
  display: inline-block;
  width: 1px;
  height: 0.875rem;
  margin: 0 0.36rem;
}
.rating-p-bar {
  @apply pt-2;
  height: 100%;
  position: absolute;
  z-index: 1;
  width: 100%;
  top: 0px;
  left: 0px;

  box-sizing: border-box;
}
.rating-p-bar-inner-parent {
  @apply border border-solid border-primary-400/20 rounded bg-white dark:bg-black/20;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.rating-p-bar-inner {
  @apply bg-primary-400/20;
  height: 100%;
}
</style>
