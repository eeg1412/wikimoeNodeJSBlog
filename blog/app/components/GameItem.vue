<template>
  <LazyACGNItem
    v-if="game"
    :item="game"
    :badge="game.gamePlatform"
    type="game"
    :enableSummaryToggle="enableSummaryToggle"
    :summaryToggleThreshold="summaryToggleThreshold"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        v-if="game.giveUp"
      >
        <div v-if="game.startTime && game.endTime">
          <div class="acgn-time text-gray-400">
            {{
              `${formatDate(
                game.startTime,
                t('common.acgn.dateFormat')
              )} ~ ${formatDate(game.endTime, t('common.acgn.dateFormat'))}`
            }}
          </div>
          <div
            class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          >
            <WUIIcon
              name="i-heroicons-bookmark-slash"
              class="align-middle acgn-time-icon"
            />{{
              t('common.acgn.playAfterDropped', {
                duration: acgDurationText(game.startTime, game.endTime)
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
      <div v-else-if="game.startTime">
        <div class="acgn-time text-gray-400">
          {{
            `${formatDate(game.startTime, t('common.acgn.dateFormat'))} ~ ${
              game.endTime
                ? formatDate(game.endTime, t('common.acgn.dateFormat'))
                : t('common.acgn.playing')
            }`
          }}<LoadingDots v-if="!game.endTime && showAnimeDot" />
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        >
          <template v-if="!game.endTime"
            ><WUIIcon
              name="i-heroicons-clock"
              class="align-middle acgn-time-icon"
            />{{ t('common.acgn.accumulatedPlay') }}</template
          ><template v-else
            ><WUIIcon
              name="i-heroicons-star"
              class="align-middle acgn-time-icon"
            />{{ t('common.acgn.totalPlay') }}</template
          >{{ acgDurationText(game.startTime, game.endTime) }}
        </div>
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const { t } = useLang()
const { acgDurationText } = useLocalizedText()

const props = defineProps({
  game: {
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
