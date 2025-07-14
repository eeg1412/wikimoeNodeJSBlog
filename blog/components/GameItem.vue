<template>
  <LazyACGNItem v-if="game" :item="game" :badge="game.gamePlatform">
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
                'yyyy年M月dd日 h时'
              )} ~ ${formatDate(game.endTime, 'yyyy年M月dd日 h时')}`
            }}
          </div>
          <div
            class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          >
            <UIcon
              name="i-heroicons-bookmark-slash"
              class="align-middle acgn-time-icon"
            />游玩{{ getACGDuration(game.startTime, game.endTime) }}后弃坑
          </div>
        </div>
        <template v-else>
          <UIcon
            name="i-heroicons-bookmark-slash"
            class="align-middle acgn-time-icon"
          />已弃坑
        </template>
      </div>
      <!-- 用时 -->
      <div v-else-if="game.startTime">
        <div class="acgn-time text-gray-400">
          {{
            `${formatDate(game.startTime, 'yyyy年M月dd日 h时')} ~ ${
              game.endTime
                ? formatDate(game.endTime, 'yyyy年M月dd日 h时')
                : '攻略中'
            }`
          }}<LoadingDots v-if="!game.endTime && showAnimeDot" />
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        >
          <template v-if="!game.endTime"
            ><UIcon
              name="i-heroicons-clock"
              class="align-middle acgn-time-icon"
            />已累计游玩</template
          ><template v-else
            ><UIcon
              name="i-heroicons-star"
              class="align-middle acgn-time-icon"
            />共计游玩</template
          >{{ getACGDuration(game.startTime, game.endTime) }}
        </div>
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  showAnimeDot: {
    type: Boolean,
    default: true
  }
})
</script>
<style scoped></style>
