<template>
  <LazyACGNItem
    v-if="book"
    :item="book"
    :badge="book.booktype"
    type="book"
    :enableSummaryToggle="enableSummaryToggle"
    :summaryToggleThreshold="summaryToggleThreshold"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        v-if="book.giveUp"
      >
        <div v-if="book.startTime && book.endTime">
          <div class="acgn-time text-gray-400">
            {{
              `${formatDate(
                book.startTime,
                t('common.acgn.dateFormat')
              )} ~ ${formatDate(book.endTime, t('common.acgn.dateFormat'))}`
            }}
          </div>
          <div
            class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          >
            <WUIIcon
              name="i-heroicons-bookmark-slash"
              class="align-middle acgn-time-icon"
            />{{
              t('common.acgn.readAfterDropped', {
                duration: acgDurationText(book.startTime, book.endTime)
              })
            }}
          </div>
        </div>
        <template v-else>
          <WUIIcon
            name="i-heroicons-bookmark-slash"
            class="align-middle acgn-time-icon"
          />{{ t('common.acgn.dropped') }}
        </template>
      </div>
      <!-- 用时 -->
      <div v-else-if="book.startTime">
        <div class="acgn-time text-gray-400">
          {{
            `${formatDate(book.startTime, t('common.acgn.dateFormat'))} ~ ${
              book.endTime
                ? formatDate(book.endTime, t('common.acgn.dateFormat'))
                : t('common.acgn.reading')
            }`
          }}<LoadingDots v-if="!book.endTime && showAnimeDot" />
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        >
          <template v-if="!book.endTime"
            ><WUIIcon
              name="i-heroicons-clock"
              class="align-middle acgn-time-icon"
            />{{ t('common.acgn.accumulatedRead') }}</template
          ><template v-else
            ><WUIIcon
              name="i-heroicons-star"
              class="align-middle acgn-time-icon"
            />{{ t('common.acgn.totalRead') }}</template
          >{{ acgDurationText(book.startTime, book.endTime) }}
        </div>
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const { t } = useLang()
const { acgDurationText } = useLocalizedText()

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  showAnimeDot: {
    type: Boolean,
    default: true
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
