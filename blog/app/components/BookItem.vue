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
                'yyyy年M月dd日 h时'
              )} ~ ${formatDate(book.endTime, 'yyyy年M月dd日 h时')}`
            }}
          </div>
          <div
            class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          >
            <WUIIcon
              name="i-heroicons-bookmark-slash"
              class="align-middle acgn-time-icon"
            />阅读{{ getACGDuration(book.startTime, book.endTime) }}后弃坑
          </div>
        </div>
        <template v-else>
          <WUIIcon
            name="i-heroicons-bookmark-slash"
            class="align-middle acgn-time-icon"
          />已弃坑
        </template>
      </div>
      <!-- 用时 -->
      <div v-else-if="book.startTime">
        <div class="acgn-time text-gray-400">
          {{
            `${formatDate(book.startTime, 'yyyy年M月dd日 h时')} ~ ${
              book.endTime
                ? formatDate(book.endTime, 'yyyy年M月dd日 h时')
                : '阅读中'
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
            />已累计阅读</template
          ><template v-else
            ><WUIIcon
              name="i-heroicons-star"
              class="align-middle acgn-time-icon"
            />共计阅读</template
          >{{ getACGDuration(book.startTime, book.endTime) }}
        </div>
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
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
