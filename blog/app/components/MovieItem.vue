<template>
  <LazyACGNItem
    v-if="movie"
    :item="movie"
    :badge="{
      name: t('common.media.movie'),
      color: '#fb923c'
    }"
    type="movie"
    :enableSummaryToggle="enableSummaryToggle"
    :summaryToggleThreshold="summaryToggleThreshold"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
      >
        <WUIIcon
          name="i-heroicons-star"
          class="align-middle acgn-time-icon"
          v-if="watDate"
        />{{ watDate }}
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const { t } = useLang()

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  enableSummaryToggle: {
    type: Boolean,
    default: false
  },
  summaryToggleThreshold: {
    type: Number,
    default: undefined
  }
})
const watDate = computed(() => {
  if (props.movie.year && props.movie.month && props.movie.day) {
    return t('common.acgn.watchedOn', {
      year: props.movie.year,
      month: props.movie.month,
      day: props.movie.day
    })
  }
  return ''
})
</script>
<style scoped></style>
