<template>
  <LazyACGNItem
    v-if="bangumi"
    :item="bangumi"
    :badge="{
      name: t('common.media.bangumi'),
      color: '#f472b6'
    }"
    type="bangumi"
    :enableSummaryToggle="enableSummaryToggle"
    :summaryToggleThreshold="summaryToggleThreshold"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
      >
        <WUIIcon
          name="i-heroicons-calendar-20-solid"
          class="align-middle acgn-time-icon"
        />{{
          t('common.acgn.yearSeason', {
            year: bangumi.year,
            season: seasonName(bangumi.season)
          })
        }}
      </div>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        v-if="bangumi.giveUp"
      >
        <WUIIcon
          name="i-heroicons-bookmark-slash"
          class="align-middle mr-1"
        />{{ t('common.acgn.dropped') }}
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const { t } = useLang()
const { seasonName } = useLocalizedText()

const props = defineProps({
  bangumi: {
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
</script>
<style scoped></style>
