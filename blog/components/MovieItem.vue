<template>
  <LazyACGNItem
    v-if="movie"
    :item="movie"
    :badge="{
      name: '电影',
      color: '#fb923c'
    }"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
      >
        <UIcon
          name="i-heroicons-star"
          class="align-middle acgn-time-icon"
          v-if="watDate"
        />{{ watDate }}
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})
const watDate = computed(() => {
  if (props.movie.year && props.movie.month && props.movie.day) {
    return `${props.movie.year}年${props.movie.month}月${props.movie.day}日观看`
  }
  return ''
})
</script>
<style scoped></style>
